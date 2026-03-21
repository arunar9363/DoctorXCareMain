// backend/src/routes/chat.routes.js
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// ── In-memory chat history store (per session) ────────────────────────────────
// For logged-in users, MongoDB is used. For guests, this is ephemeral.
const sessionStore = new Map();

// ── Chat Message Model (inline schema for chat) ───────────────────────────────
import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId:   { type: String, required: true },
  userMessage: { type: String, required: true },
  botResponse: { type: String, required: true },
  createdAt:   { type: Date, default: Date.now }
});

chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1, sessionId: 1 });

const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

// ── POST /api/chat — Send message with conversation history ───────────────────
router.post('/', async (req, res) => {
  try {
    const { message, systemPrompt, history = [], sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build chat with full conversation history so AI remembers context
    // history format: [{ role: "user"|"model", parts: [{ text: "..." }] }]
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7
      }
    });

    // Prepend system prompt to first message if history is empty
    const messageToSend = (history.length === 0 && systemPrompt)
      ? `${systemPrompt}\n\nUser Query: ${message}`
      : message;

    const result = await chat.sendMessage(messageToSend);
    const response = result.response.text();

    // Store in session store for guest users
    if (sessionId) {
      const existing = sessionStore.get(sessionId) || [];
      existing.push({ userMessage: message, botResponse: response });
      // Keep only last 50 turns per session to avoid memory leak
      if (existing.length > 50) existing.shift();
      sessionStore.set(sessionId, existing);
    }

    res.status(200).json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/chat/save — Save a conversation turn to MongoDB ─────────────────
router.post('/save', protect, async (req, res) => {
  try {
    const { sessionId, userMessage, botResponse } = req.body;

    if (!sessionId || !userMessage || !botResponse) {
      return res.status(400).json({ error: 'sessionId, userMessage and botResponse are required' });
    }

    const saved = await ChatMessage.create({
      userId:      req.user._id,
      sessionId,
      userMessage,
      botResponse
    });

    res.status(201).json({ success: true, id: saved._id });
  } catch (error) {
    console.error('Chat save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/chat/history — Load conversation history from MongoDB ─────────────
router.get('/history', protect, async (req, res) => {
  try {
    // Get last 30 messages (15 turns) for context
    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Reverse to chronological order
    const history = messages.reverse().map(m => ({
      sessionId:   m.sessionId,
      userMessage: m.userMessage,
      botResponse: m.botResponse,
      createdAt:   m.createdAt
    }));

    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/chat/history/:sessionId — Clear session chat ──────────────────
router.delete('/history/:sessionId', protect, async (req, res) => {
  try {
    await ChatMessage.deleteMany({
      userId:    req.user._id,
      sessionId: req.params.sessionId
    });

    // Also clear in-memory store
    sessionStore.delete(req.params.sessionId);

    res.status(200).json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    console.error('Chat delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;