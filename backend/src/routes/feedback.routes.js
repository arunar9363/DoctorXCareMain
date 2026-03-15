import express from 'express'
import Feedback from '../models/Feedback.js'
const router = express.Router()

// GET /api/feedbacks  — public
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 })
    res.json(feedbacks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/feedbacks  — user submits feedback
router.post('/', async (req, res) => {
  try {
    const { name, message, type } = req.body
    if (!name || !message) return res.status(400).json({ error: 'Name and message required' })
    const feedback = await Feedback.create({ name, message, type })
    res.status(201).json(feedback)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router