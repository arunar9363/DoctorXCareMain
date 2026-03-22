import { useState, useRef, useEffect } from "react";
import { sendChatMessageAPI } from "../api/chat.api.js";
import useAuth from "../hooks/useAuth.js";
import API from "../api/axios.js";

export default function DoctorXAIPage() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm DoctorXCare, your AI medical assistant. How can I help you today? Please feel free to ask any health-related questions you might have."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [conversationLoaded, setConversationLoaded] = useState(false);
  const chatBoxRef = useRef(null);

  // ── Conversation history for AI context (keeps full chat for Gemini) ────────
  // Each entry: { role: "user" | "model", parts: [{ text: "..." }] }
  const conversationHistoryRef = useRef([]);

  // Simple markdown to HTML converter
  const parseMarkdown = (text) => {
    if (!text) return "";
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    text = text.replace(/^\* (.+)$/gm, '<li>$1</li>');
    text = text.replace(/^- (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
    text = text.replace(/\n/g, '<br/>');
    return text;
  };

  // ── Theme detection ─────────────────────────────────────────────────────────
  useEffect(() => {
    const htmlElement = document.documentElement;
    const currentTheme = localStorage.getItem("theme") || "light";
    setTheme(currentTheme);

    const handleStorageChange = () => {
      const newTheme = localStorage.getItem("theme") || "light";
      setTheme(newTheme);
    };

    window.addEventListener("storage", handleStorageChange);

    const observer = new MutationObserver(() => {
      const newTheme = htmlElement.getAttribute("data-theme") || localStorage.getItem("theme") || "light";
      setTheme(newTheme);
    });

    observer.observe(htmlElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      observer.disconnect();
    };
  }, []);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Load previous conversation from MongoDB when user logs in ───────────────
  useEffect(() => {
    if (!user || conversationLoaded) return;

    const loadPreviousChat = async () => {
      try {
        const res = await API.get('/api/chat/history');
        const history = res.data?.history || [];

        if (history.length > 0) {
          // Restore messages for UI display
          const restoredMessages = [
            {
              type: "bot",
              text: "Hello! I'm DoctorXCare, your AI medical assistant. How can I help you today? Please feel free to ask any health-related questions you might have."
            }
          ];

          // Restore conversation history for AI context
          const restoredHistory = [];

          history.forEach(entry => {
            restoredMessages.push({ type: "user", text: entry.userMessage });
            restoredMessages.push({ type: "bot", text: entry.botResponse });

            // Rebuild Gemini conversation history
            restoredHistory.push({ role: "user", parts: [{ text: entry.userMessage }] });
            restoredHistory.push({ role: "model", parts: [{ text: entry.botResponse }] });
          });

          setMessages(restoredMessages);
          conversationHistoryRef.current = restoredHistory;
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        // No history or not logged in — fresh start is fine
        console.log('No previous chat history found');
      } finally {
        setConversationLoaded(true);
      }
    };

    loadPreviousChat();
  }, [user, conversationLoaded]);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    // Add user message to UI
    setMessages(prev => [...prev, { type: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    const systemPrompt = `You are DoctorXCare, a professional AI medical assistant and doctor. Be helpful, informative, polite, and provide accurate health information. Always give medical help as a doctor would, including suggesting appropriate medicines, treatments, and remedies when relevant. Provide SHORT and BEST solutions to medical problems - be concise, direct, and focus on the most effective treatments. Keep responses point. Provide professional medical advice, medication suggestions, and treatment options in a clear, easy-to-understand format. and always prioritize user safety and well-being. provide disclaimers when necessary. provide medical information based on established medical guidelines and practices. Never provide harmful or dangerous advice.
    do not answer questions outside the medical domain. do not mention disclaimer unless asked.`;

    try {
      // Send to backend with full conversation history for context
      const res = await sendChatMessageAPI({
        message: userMessage,
        systemPrompt: systemPrompt,
        // Full history so Gemini remembers previous messages
        history: conversationHistoryRef.current,
        sessionId: sessionId
      });

      const data = res.data;

      if (data.response) {
        const botReply = data.response;

        // Add bot reply to UI
        setMessages(prev => [...prev, { type: "bot", text: botReply }]);

        // Update conversation history for AI context (both user + bot)
        conversationHistoryRef.current = [
          ...conversationHistoryRef.current,
          { role: "user", parts: [{ text: userMessage }] },
          { role: "model", parts: [{ text: botReply }] }
        ];

        // Save conversation turn to MongoDB if user is logged in
        if (user) {
          try {
            await API.post('/api/chat/save', {
              sessionId: sessionId,
              userMessage: userMessage,
              botResponse: botReply
            });
          } catch (saveErr) {
            // Save failed silently — chat still works
            console.error('Failed to save chat to MongoDB:', saveErr);
          }
        }
      } else {
        setMessages(prev => [...prev, { type: "error", text: "Error: " + data.error }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { type: "error", text: "Error: " + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  // ── Clear conversation ──────────────────────────────────────────────────────
  const clearConversation = async () => {
    conversationHistoryRef.current = [];
    setMessages([{
      type: "bot",
      text: "Hello! I'm DoctorXCare, your AI medical assistant. How can I help you today? Please feel free to ask any health-related questions you might have."
    }]);

    if (user) {
      try {
        await API.delete(`/api/chat/history/${sessionId}`);
      } catch (err) {
        console.error('Failed to clear chat history:', err);
      }
    }
  };

  const colors = {
    light: {
      primary: "#ffffff",
      secondary: "#0d9db8",
      third: "#3b82f6",
      fourth: "#f0f9fb",
      dark: "#1a1a1a",
      border: "#e0e7ff",
      bg: "#f0f9fb",
      shadow: "0 4px 20px rgba(13, 157, 184, 0.1)",
      headerBg: "linear-gradient(135deg, #e0f2fe 0%, #f0f9fb 100%)",
    },
    dark: {
      primary: "#0f172a",
      secondary: "#0d9db8",
      third: "#60a5fa",
      fourth: "#1e293b",
      dark: "#e2e8f0",
      border: "#334155",
      bg: "#0f172a",
      shadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      headerBg: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    },
  };

  const c = colors[theme];

  return (
    <div style={styles.pageWrapper(c, theme)}>
      {/* Chat Container */}
      <div style={styles.chatWrapper(c)}>
        <div style={styles.container(c)}>

          {/* Header — show when chat has started */}
          {messages.length > 1 && (
            <div style={styles.header(c)}>
              <img src="/assets/MAINLOGO2.png" alt="DoctorX" style={styles.headerLogo} />
              <h2 style={styles.headerTitle(c)}>DoctorXCare AI Assistance</h2>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Context indicator — shows AI remembers previous messages */}
                {conversationHistoryRef.current.length > 0 && (
                  <span style={{
                    fontSize: '11px',
                    color: c.secondary,
                    background: `${c.secondary}15`,
                    border: `1px solid ${c.secondary}30`,
                    padding: '3px 8px',
                    borderRadius: '20px',
                    fontWeight: 600
                  }}>
                    🧠 {Math.floor(conversationHistoryRef.current.length / 2)} messages remembered
                  </span>
                )}
                {/* Clear chat button */}
                <button
                  onClick={clearConversation}
                  title="Clear conversation"
                  style={{
                    background: 'none',
                    border: `1px solid ${c.border}`,
                    borderRadius: '8px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    color: c.dark,
                    fontSize: '12px',
                    fontWeight: 600,
                    opacity: 0.7,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Chat Content */}
          <div style={styles.chatContainer(c)} ref={chatBoxRef}>
            {messages.length === 1 && messages[0].type === "bot" && (
              <div style={styles.welcome}>
                <img src="/assets/MAINLOGO2.png" alt="DoctorX" style={styles.welcomeLogo} />
                <h2 style={{ color: c.dark, marginTop: "24px", fontSize: "28px", fontWeight: "700" }}>
                  Welcome to DoctorXCare AI Assistance
                </h2>
                <p style={{ color: c.dark, opacity: 0.7, fontSize: "14px", maxWidth: "400px", margin: "12px auto 0" }}>
                  Ask me health-related questions about symptoms, diseases, treatments, and general wellness advice <br />Powered by Gemini-pro.
                </p>
                {user && (
                  <p style={{ color: c.secondary, fontSize: "12px", marginTop: "8px", fontWeight: 600 }}>
                    ✓ Logged in — conversations saved & AI remembers your history
                  </p>
                )}
                <div style={styles.suggestionBox(c)}>
                  <p style={{ fontSize: "12px", opacity: 0.6, margin: "0 0 12px 0", textAlign: "left" }}>
                    Try asking:
                  </p>
                  <div style={styles.suggestions}>
                    {["What to do for a headache?", "How to improve immunity naturally?", "How to reduce stress and anxiety?"].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(q)}
                        style={styles.suggestionBtn(c)}
                        onMouseEnter={(e) => {
                          e.target.style.background = c.secondary;
                          e.target.style.color = "white";
                          e.target.style.borderColor = c.secondary;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = c.fourth;
                          e.target.style.color = c.dark;
                          e.target.style.borderColor = c.border;
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} style={msg.type === "user" ? styles.userMessageBox : styles.botMessageBox}>
                <div style={styles.messageRow(msg.type)}>
                  {msg.type !== "user" && (
                    <img src="/assets/MAINLOGO2.png" alt="Bot" style={styles.avatar} />
                  )}
                  <div
                    style={
                      msg.type === "user"
                        ? styles.userContent(c)
                        : msg.type === "error"
                          ? styles.errorContent
                          : styles.botContent(c)
                    }
                  >
                    {msg.type === "bot" ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                        style={{ lineHeight: "1.6" }}
                      />
                    ) : (
                      msg.text
                    )}
                  </div>
                  {msg.type === "user" && (
                    <img src="/assets/profile.jpg" alt="User" style={styles.avatar} />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={styles.botMessageBox}>
                <div style={styles.messageRow("bot")}>
                  <img src="/assets/MAINLOGO2.png" alt="Bot" style={styles.avatar} />
                  <div style={styles.botContent(c)}>
                    <div style={styles.typingIndicator}>
                      <span style={styles.dot}></span>
                      <span style={styles.dot}></span>
                      <span style={styles.dot}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Container */}
          <div style={styles.inputContainer(c)}>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your health question here..."
                style={styles.input(c)}
                disabled={loading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading}
              style={styles.sendButton(c, loading)}
              title={loading ? "Waiting for response..." : "Send message"}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        div::-webkit-scrollbar { width: 8px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: #0d9db8; border-radius: 10px; }
        div::-webkit-scrollbar-thumb:hover { background: #0a7a8f; }
        h1, h2, h3 { margin: 12px 0 8px 0; font-weight: 700; }
        h1 { font-size: 20px; }
        h2 { font-size: 18px; }
        h3 { font-size: 16px; }
        ul { margin: 10px 0; padding-left: 20px; }
        li { margin-bottom: 5px; }
        strong { font-weight: 700; }
        em { font-style: italic; }
      `}</style>
    </div>
  );
}

const styles = {
  pageWrapper: (c) => ({
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: c.bg,
    fontFamily: "'Inter', sans-serif",
    marginTop: "62px",
    transition: "background 0.3s ease",
  }),

  chatWrapper: (c) => ({
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "10px",
    background: c.bg,
    width: "100%",
  }),

  container: (c) => ({
    width: "100%",
    maxWidth: "900px",
    background: c.primary,
    borderRadius: "12px",
    boxShadow: c.shadow,
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 100px)",
    maxHeight: "85vh",
    overflow: "hidden",
    transition: "all 0.3s ease",
    border: `1px solid ${c.border}`,
  }),

  header: (c) => ({
    padding: "16px 32px",
    background: c.primary,
    borderBottom: `1px solid ${c.border}`,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "background 0.3s ease",
  }),

  headerLogo: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    objectFit: "cover",
  },

  headerTitle: (c) => ({
    color: c.dark,
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
  }),

  chatContainer: (c) => ({
    flex: 1,
    overflowY: "auto",
    padding: "32px",
    background: c.fourth,
    scrollBehavior: "smooth",
    transition: "background 0.3s ease",
  }),

  welcome: {
    textAlign: "center",
    padding: "40px 20px",
    animation: "slideIn 0.5s ease-out",
  },

  welcomeLogo: {
    width: "72px",
    height: "72px",
    borderRadius: "16px",
    objectFit: "cover",
    boxShadow: "0 8px 24px rgba(13, 157, 184, 0.2)",
  },

  suggestionBox: (c) => ({
    marginTop: "24px",
    padding: "20px",
    background: c.primary,
    borderRadius: "12px",
    border: `1px solid ${c.border}`,
  }),

  suggestions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  suggestionBtn: (c) => ({
    padding: "12px 16px",
    background: c.fourth,
    border: `1px solid ${c.border}`,
    borderRadius: "8px",
    color: c.dark,
    cursor: "pointer",
    fontSize: "13px",
    transition: "all 0.3s ease",
    textAlign: "left",
    fontWeight: "500",
  }),

  userMessageBox: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
    animation: "slideIn 0.3s ease-out",
  },

  botMessageBox: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "20px",
    animation: "slideIn 0.3s ease-out",
  },

  messageRow: (type) => ({
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    justifyContent: type === "user" ? "flex-end" : "flex-start",
    maxWidth: "85%",
    flexDirection: "column",
  }),

  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },

  userContent: (c) => ({
    background: c.secondary,
    color: "white",
    padding: "18px 18px",
    borderRadius: "16px",
    borderBottomRight: "2px",
    wordWrap: "break-word",
    lineHeight: "1.6",
    fontSize: "14px",
    boxShadow: "0 2px 8px rgba(13, 157, 184, 0.2)",
  }),

  botContent: (c) => ({
    background: c.primary,
    color: c.dark,
    padding: "18px 18px",
    borderRadius: "16px",
    borderBottomLeft: "2px",
    wordWrap: "break-word",
    lineHeight: "1.6",
    fontSize: "14px",
    boxShadow: `0 2px 8px ${c.shadow}`,
    border: `1px solid ${c.border}`,
  }),

  errorContent: {
    background: "#fef2f2",
    color: "#991b1b",
    padding: "14px 18px",
    borderRadius: "16px",
    wordWrap: "break-word",
    lineHeight: "1.6",
    fontSize: "14px",
    borderLeft: "4px solid #dc2626",
  },

  typingIndicator: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    padding: "8px 0",
  },

  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#0d9db8",
    animation: "typing 1.4s ease-in-out infinite",
  },

  inputContainer: (c) => ({
    padding: "15px 22px",
    background: c.primary,
    borderTop: `1px solid ${c.border}`,
    display: "flex",
    gap: "12px",
    alignItems: "center",
    transition: "background 0.3s ease",
  }),

  inputWrapper: {
    flex: 1,
    display: "flex",
  },

  input: (c) => ({
    flex: 1,
    padding: "10px 18px",
    border: `2px solid ${c.border}`,
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    background: c.fourth,
    color: c.dark,
    transition: "all 0.3s ease",
    fontFamily: "'Inter', sans-serif",
  }),

  sendButton: (c, disabled) => ({
    background: c.secondary,
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(13, 157, 184, 0.3)",
    opacity: disabled ? 0.7 : 1,
  }),
};