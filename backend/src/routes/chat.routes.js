import express from 'express'
import Groq from 'groq-sdk'
import mongoose from 'mongoose'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ── In-memory session store for guest users ──────────────────────
const sessionStore = new Map()

// ── Chat Message Model (inline) ──────────────────────────────────
const chatMessageSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId:   { type: String, required: true },
  userMessage: { type: String, required: true },
  botResponse: { type: String, required: true },
  createdAt:   { type: Date, default: Date.now }
})
chatMessageSchema.index({ userId: 1, createdAt: -1 })
chatMessageSchema.index({ userId: 1, sessionId: 1 })
const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema)

// DoctorXCare AI system prompt
const SYSTEM_PROMPT = `You are DoctorXCare, a professional AI medical assistant. 
Be helpful, informative, polite, and provide accurate health information. 
Always give medical help as a doctor would — suggest appropriate medicines, treatments, and remedies when relevant.
Provide SHORT and BEST solutions — be concise, direct, and focus on the most effective treatments.
Provide professional medical advice, medication suggestions, and treatment options in a clear, easy-to-understand format.
Always prioritize user safety and well-being. Provide disclaimers when necessary.
Base your answers on established medical guidelines and practices.
Never provide harmful or dangerous advice.
Do not answer questions outside the medical domain.`

// ── POST /api/chat — Send message ───────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { message, history = [], sessionId } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Build messages array for Groq: system prompt + conversation history + new message
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ]

    // Add conversation history (format: [{role: 'user'|'assistant', content: '...'}])
    for (const turn of history) {
      if (turn.role && turn.content) {
        messages.push({ role: turn.role, content: turn.content })
      }
    }

    // Add current user message
    messages.push({ role: 'user', content: message })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1000
    })

    const response = completion.choices[0]?.message?.content || ''

    // Store in session store for guest users
    if (sessionId) {
      const existing = sessionStore.get(sessionId) || []
      existing.push({ userMessage: message, botResponse: response })
      if (existing.length > 50) existing.shift()
      sessionStore.set(sessionId, existing)
    }

    res.status(200).json({ response })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ── POST /api/chat/save — Save turn to MongoDB ───────────────────
router.post('/save', protect, async (req, res) => {
  try {
    const { sessionId, userMessage, botResponse } = req.body

    if (!sessionId || !userMessage || !botResponse) {
      return res.status(400).json({ error: 'sessionId, userMessage and botResponse are required' })
    }

    const saved = await ChatMessage.create({
      userId: req.user._id,
      sessionId,
      userMessage,
      botResponse
    })

    res.status(201).json({ success: true, id: saved._id })
  } catch (error) {
    console.error('Chat save error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ── GET /api/chat/history — Load from MongoDB ────────────────────
router.get('/history', protect, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean()

    const history = messages.reverse().map(m => ({
      sessionId:   m.sessionId,
      userMessage: m.userMessage,
      botResponse: m.botResponse,
      createdAt:   m.createdAt
    }))

    res.status(200).json({ success: true, history })
  } catch (error) {
    console.error('Chat history error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ── DELETE /api/chat/history/:sessionId — Clear session ──────────
router.delete('/history/:sessionId', protect, async (req, res) => {
  try {
    await ChatMessage.deleteMany({ userId: req.user._id, sessionId: req.params.sessionId })
    sessionStore.delete(req.params.sessionId)
    res.status(200).json({ success: true, message: 'Chat history cleared' })
  } catch (error) {
    console.error('Chat delete error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
