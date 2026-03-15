import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
const router = express.Router()

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message } = req.body
    if (!message) return res.status(400).json({ error: 'Message is required' })

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent(message)
    res.json({ response: result.response.text() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router