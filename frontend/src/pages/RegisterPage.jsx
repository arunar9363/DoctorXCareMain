import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Replaced: import { auth, db } from "../firebase"
//           import { createUserWithEmailAndPassword } from "firebase/auth"
//           import { doc, setDoc } from "firebase/firestore"
import { registerAPI } from "../api/auth.api.js";
import { useAuth } from "../context/AuthContext.jsx";

import loginImage from "/assets/ragisterpage.svg";
import LoginModal from "../components/common/LoginModal";

// Enhanced Toast Component with modern animations
const SimpleToast = ({ message, type, show, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !isVisible) return null;

  const toastStyles = {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: 9999,
    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
    opacity: isVisible ? 1 : 0,
    background: type === 'success'
      ? 'linear-gradient(135deg, #10b981, #059669)'
      : type === 'error'
        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
        : type === 'warning'
          ? 'linear-gradient(135deg, #f59e0b, #d97706)'
          : 'linear-gradient(135deg, #3b82f6, #2563eb)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '16px 20px',
    minWidth: '320px',
    maxWidth: '400px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    color: 'white',
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '✓';
    }
  };

  return (
    <div style={toastStyles}>
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
      }}>
        {getIcon()}
      </div>
      <div style={{ flex: 1, fontWeight: '600', fontSize: '14px' }}>
        {message}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          padding: '4px',
        }}
      >
        ×
      </button>
    </div>
  );
};

function RegisterPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [focusedInput, setFocusedInput] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  // Replaced: Firebase auth state → JWT AuthContext login()
  const { login } = useAuth();

  // Detect dark mode and screen size
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsDark(theme === 'dark');
    };

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    checkTheme();
    checkScreenSize();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    window.addEventListener('resize', checkScreenSize);

    // Trigger fade-in animation
    setTimeout(() => setIsVisible(true), 100);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Add animations CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-40px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-15px);
        }
      }

      @keyframes pulse-glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(13, 157, 184, 0.3);
        }
        50% {
          box-shadow: 0 0 40px rgba(13, 157, 184, 0.5);
        }
      }

      .gradient-text {
        background: linear-gradient(135deg, #0d9db8, #60a5fa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .input-focus-effect {
        position: relative;
      }

      .input-focus-effect::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, #0d9db8, #60a5fa);
        transition: width 0.3s ease;
      }

      .input-focus-effect.focused::after {
        width: 100%;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const validateForm = () => {
    if (!name.trim()) {
      showToast("Please enter your full name.", "error");
      return false;
    }

    if (name.trim().length < 2) {
      showToast("Name must be at least 2 characters long.", "error");
      return false;
    }

    if (!email.trim()) {
      showToast("Please enter your email address.", "error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return false;
    }

    if (!password) {
      showToast("Please enter a password.", "error");
      return false;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long.", "error");
      return false;
    }

    if (!confirmPassword) {
      showToast("Please confirm your password.", "error");
      return false;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match! Please check and try again.", "error");
      return false;
    }

    return true;
  };

  // Replaced: createUserWithEmailAndPassword(auth, email, password)
  //           + setDoc(doc(db, "users", user.uid), {...})
  //         → registerAPI() → POST /api/auth/register → MongoDB
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await registerAPI({
        name: name.trim(),
        email: email.trim(),
        password: password
      });

      const { token, user } = res.data;

      // Store JWT token + user in AuthContext (replaces Firebase auth state)
      login(token, user);

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      showToast("Registration successful! Welcome to DoctorXCare!", "success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      let errorMessage = "Registration failed. Please try again.";

      const serverError = err.response?.data?.error || '';

      // Replaced: Firebase auth error codes (auth/email-already-in-use etc.)
      //         → backend error string matching
      if (serverError.toLowerCase().includes('already registered') ||
        serverError.toLowerCase().includes('already exists')) {
        errorMessage = "This email is already registered. Please use a different email or login.";
      } else if (serverError.toLowerCase().includes('password')) {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (serverError.toLowerCase().includes('email')) {
        errorMessage = "Invalid email address. Please check and try again.";
      } else if (err.code === "ERR_NETWORK" || err.message?.includes('Network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (serverError) {
        errorMessage = serverError;
      }

      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isSmall = window.innerWidth <= 480;

  // Styles inspired by Services page
  const pageStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    minHeight: '100vh',
    width: '100%',
    fontFamily: '"Inter", sans-serif',
    background: isDark
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0f172a 50%, #1e1b4b 75%, #0f172a 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 25%, #e0f2fe 50%, #f0f9ff 75%, #ffffff 100%)',
    paddingTop: isMobile ? '70px' : '0',
    position: 'relative',
    overflow: 'hidden',
  };

  const backgroundPattern = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: isDark ? 0.03 : 0.05,
    backgroundImage: `radial-gradient(circle at 25px 25px, ${isDark ? '#60a5fa' : '#0d9db8'} 2%, transparent 0%), 
                      radial-gradient(circle at 75px 75px, ${isDark ? '#0d9db8' : '#60a5fa'} 2%, transparent 0%)`,
    backgroundSize: '100px 100px',
    pointerEvents: 'none',
  };

  const leftStyle = {
    flex: isMobile ? 'none' : 1,
    width: isMobile ? '100%' : 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : (isTablet ? '40px 30px' : '40px 40px'),
    textAlign: 'center',
    minWidth: 0,
    minHeight: isMobile ? 'auto' : '100vh',
    position: 'relative',
    zIndex: 1,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(-40px)',
    transition: 'all 0.8s ease-out',
  };

  const badgeStyle = {
    display: 'inline-block',
    padding: '6px 16px',
    background: isDark
      ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.15), rgba(96, 165, 250, 0.15))'
      : 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(59, 130, 246, 0.1))',
    border: `1px solid ${isDark ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`,
    borderRadius: '50px',
    fontSize: isSmall ? '0.65rem' : '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '12px',
    color: isDark ? '#60a5fa' : '#0d9db8',
    animation: 'scaleIn 0.6s ease-out 0.2s backwards',
  };

  const leftH1Style = {
    fontSize: isSmall ? '1.7rem' : isMobile ? '2.0rem' : 'clamp(2.2rem, 3.7vw, 3rem)',
    marginBottom: '12px',
    fontWeight: 800,
    lineHeight: 1.4,
    fontFamily: "'Merriweather', serif",
    color: isDark ? '#f9fafb' : '#0f172a',
    animation: 'slideInLeft 0.8s ease-out 0.3s backwards',
  };

  const leftPStyle = {
    color: isDark ? '#9ca3af' : '#64748b',
    fontSize: isSmall ? '0.85rem' : isMobile ? '0.9rem' : 'clamp(0.9rem, 1.8vw, 1rem)',
    marginBottom: '20px',
    lineHeight: 1.6,
    maxWidth: '450px',
    animation: 'fadeInUp 0.8s ease-out 0.5s backwards',
  };

  const imgStyle = {
    maxWidth: isSmall ? 'min(100%, 180px)' : isMobile ? 'min(100%, 220px)' : (isTablet ? 'min(100%, 280px)' : 'min(100%, 320px)'),
    width: '100%',
    height: 'auto',
    marginTop: isMobile ? '15px' : '20px',
    objectFit: 'contain',
    filter: isDark ? 'drop-shadow(0 8px 24px rgba(13, 157, 184, 0.3))' : 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.1))',
    animation: 'float 6s ease-in-out infinite, fadeInUp 1s ease-out 0.7s backwards',
  };

  const rightStyle = {
    flex: isMobile ? 'none' : 1,
    width: isMobile ? '100%' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isSmall ? '20px 16px' : isMobile ? '30px 20px' : (isTablet ? '40px 30px' : '40px 40px'),
    minWidth: 0,
    minHeight: isMobile ? 'auto' : '100vh',
    position: 'relative',
    zIndex: 1,
  };

  const formContainerStyle = {
    width: '100%',
    marginTop: isMobile ? '0' : '50px',
    maxWidth: isSmall ? '100%' : isMobile ? '420px' : (isTablet ? '460px' : '500px'),
    margin: '40px',
    background: isDark
      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: isSmall ? '28px 20px' : isMobile ? '32px 28px' : '36px 32px',
    boxShadow: isDark
      ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
      : '0 20px 60px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
    position: 'relative',
    overflow: 'hidden',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'scale(1)' : 'scale(0.95)',
    transition: 'all 0.8s ease-out 0.3s',
  };

  const topGlowStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #0d9db8, #60a5fa, #0d9db8)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s infinite',
  };

  const h2Style = {
    fontSize: isSmall ? '1.5rem' : isMobile ? '1.7rem' : 'clamp(1.7rem, 3.5vw, 2rem)',
    fontWeight: 800,
    marginBottom: isSmall ? '8px' : '10px',
    fontFamily: "'Merriweather', serif",
    lineHeight: 1.2,
    color: isDark ? '#f9fafb' : '#0f172a',
  };

  const subtitleStyle = {
    fontSize: isSmall ? '0.85rem' : isMobile ? '0.9rem' : 'clamp(0.9rem, 1.8vw, 0.95rem)',
    color: isDark ? '#9ca3af' : '#64748b',
    marginBottom: isSmall ? '20px' : '24px',
    lineHeight: 1.5,
  };

  const infoBoxStyle = {
    background: isDark
      ? 'linear-gradient(135deg, rgba(13, 157, 184, 0.1), rgba(96, 165, 250, 0.1))'
      : 'linear-gradient(135deg, rgba(13, 157, 184, 0.05), rgba(59, 130, 246, 0.05))',
    border: `1px solid ${isDark ? 'rgba(13, 157, 184, 0.3)' : 'rgba(13, 157, 184, 0.2)'}`,
    borderRadius: '12px',
    padding: isSmall ? '12px' : '14px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'start',
    gap: '10px',
  };

  const inputWrapperStyle = (inputName) => ({
    position: 'relative',
    marginBottom: isSmall ? '14px' : '16px',
    className: focusedInput === inputName ? 'input-focus-effect focused' : 'input-focus-effect',
  });

  const inputStyle = (inputName) => ({
    width: '100%',
    padding: isSmall ? '12px 14px' : '14px 16px',
    border: `2px solid ${focusedInput === inputName
      ? (isDark ? '#0d9db8' : '#0ea5c1')
      : (isDark ? '#334155' : '#e5e7eb')
      }`,
    borderRadius: '12px',
    fontSize: isSmall ? '14px' : '15px',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxSizing: 'border-box',
    background: isDark ? '#1e293b' : '#ffffff',
    fontFamily: 'inherit',
    color: isDark ? '#e2e8f0' : '#0f172a',
    boxShadow: focusedInput === inputName
      ? (isDark
        ? '0 0 0 4px rgba(13, 157, 184, 0.1), 0 4px 12px rgba(13, 157, 184, 0.2)'
        : '0 0 0 4px rgba(13, 157, 184, 0.08), 0 4px 12px rgba(13, 157, 184, 0.15)')
      : 'none',
  });

  const labelStyle = (inputName) => ({
    position: 'absolute',
    left: '18px',
    top: focusedInput === inputName ||
      (inputName === 'name' && name) ||
      (inputName === 'email' && email) ||
      (inputName === 'password' && password) ||
      (inputName === 'confirmPassword' && confirmPassword)
      ? '-10px'
      : '50%',
    transform: focusedInput === inputName ||
      (inputName === 'name' && name) ||
      (inputName === 'email' && email) ||
      (inputName === 'password' && password) ||
      (inputName === 'confirmPassword' && confirmPassword)
      ? 'translateY(0) scale(0.85)'
      : 'translateY(-50%) scale(1)',
    fontSize: '14px',
    color: focusedInput === inputName
      ? (isDark ? '#60a5fa' : '#0d9db8')
      : (isDark ? '#94a3b8' : '#64748b'),
    background: isDark ? '#1e293b' : '#ffffff',
    padding: '0 8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none',
    fontWeight: 500,
  });

  const buttonStyle = {
    width: '100%',
    padding: isSmall ? '14px' : '15px',
    background: isLoading
      ? (isDark ? 'linear-gradient(135deg, #475569, #64748b)' : 'linear-gradient(135deg, #cbd5e1, #94a3b8)')
      : 'linear-gradient(135deg, #0d9db8, #60a5fa)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: isSmall ? '14px' : '15px',
    fontWeight: 700,
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    marginTop: isSmall ? '18px' : '20px',
    position: 'relative',
    overflow: 'hidden',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    boxShadow: isLoading
      ? 'none'
      : (isDark
        ? '0 8px 24px rgba(13, 157, 184, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 8px 24px rgba(13, 157, 184, 0.35), 0 4px 12px rgba(0, 0, 0, 0.1)'),
  };

  const loginLinkStyle = {
    textAlign: 'center',
    marginTop: isSmall ? '20px' : '22px',
    paddingTop: isSmall ? '20px' : '22px',
    borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
    fontSize: isSmall ? '13px' : '14px',
    color: isDark ? '#9ca3af' : '#64748b',
  };

  const btnLoginStyle = {
    background: 'none',
    border: 'none',
    color: isDark ? '#60a5fa' : '#0d9db8',
    fontWeight: 700,
    cursor: isLoading ? 'not-allowed' : 'pointer',
    fontSize: 'inherit',
    padding: 0,
    margin: 0,
    transition: 'all 0.3s ease',
    opacity: isLoading ? 0.5 : 1,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  };

  return (
    <div style={pageStyle}>
      <div style={backgroundPattern}></div>

      <div style={leftStyle}>
        <span style={badgeStyle}>HEALTHCARE INNOVATION</span>
        <h1 style={leftH1Style}>
          <span className="gradient-text">Join DoctorXCare</span>
          <br />
          Smart Healthcare Platform
        </h1>
        <p style={leftPStyle}>
          Experience smart healthcare with AI-powered diagnostics, personalized health insights, and 24/7 medical support at your fingertips.
        </p>
        <img src={loginImage} alt="DoctorXCare Healthcare" style={imgStyle} />
      </div>

      <div style={rightStyle}>
        <div style={formContainerStyle} ref={formRef}>
          <div style={topGlowStyle}></div>

          <h2 style={h2Style}>
            <span className="gradient-text">Create Account</span>
          </h2>
          <p style={subtitleStyle}>
            Start your journey to better health with our intelligent platform.
          </p>

          <div style={infoBoxStyle}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDark ? '#60a5fa' : '#0d9db8'}
              strokeWidth="2"
              style={{ flexShrink: 0, marginTop: '2px' }}
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div style={{ fontSize: isSmall ? '12px' : '13px', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.5 }}>
              Quick setup with name and email. Add health details later in your profile.
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={inputWrapperStyle('name')}>
              <label style={labelStyle('name')}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                required
                disabled={isLoading}
                style={inputStyle('name')}
              />
            </div>

            <div style={inputWrapperStyle('email')}>
              <label style={labelStyle('email')}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                required
                disabled={isLoading}
                style={inputStyle('email')}
              />
            </div>

            <div style={inputWrapperStyle('password')}>
              <label style={labelStyle('password')}>Create Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                required
                disabled={isLoading}
                minLength="6"
                style={inputStyle('password')}
              />
            </div>

            <div style={inputWrapperStyle('confirmPassword')}>
              <label style={labelStyle('confirmPassword')}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                required
                disabled={isLoading}
                style={inputStyle('confirmPassword')}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={buttonStyle}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></span>
                  Creating Account...
                </span>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          <p style={loginLinkStyle}>
            Already have an account?{" "}
            <button
              onClick={() => setShowLogin(true)}
              type="button"
              disabled={isLoading}
              style={btnLoginStyle}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onShowToast={showToast}
      />

      <SimpleToast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={hideToast}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default RegisterPage;