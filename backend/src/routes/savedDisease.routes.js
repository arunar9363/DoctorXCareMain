import express from 'express'
import SavedDisease from '../models/SavedDisease.js'
import { protect } from '../middleware/auth.js'
const router = express.Router()

// Saari saved diseases (user ki) — GET /api/saved-diseases
router.get('/', protect, async (req, res) => {
  try {
    const diseases = await SavedDisease.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json(diseases)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Save a disease — POST /api/saved-diseases
router.post('/', protect, async (req, res) => {
  try {
    const data = { ...req.body, userId: req.user._id }
    const saved = await SavedDisease.create(data)
    res.status(201).json(saved)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Disease already saved' })
    res.status(500).json({ error: err.message })
  }
})

// Check if saved — GET /api/saved-diseases/check/:slug
router.get('/check/:slug', protect, async (req, res) => {
  try {
    const exists = await SavedDisease.findOne({ userId: req.user._id, diseaseSlug: req.params.slug })
    res.json({ isSaved: !!exists, data: exists })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Update notes — PATCH /api/saved-diseases/:slug
router.patch('/:slug', protect, async (req, res) => {
  try {
    const updated = await SavedDisease.findOneAndUpdate(
      { userId: req.user._id, diseaseSlug: req.params.slug },
      { notes: req.body.notes },
      { new: true }
    )
    res.json(updated)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Delete — DELETE /api/saved-diseases/:slug
router.delete('/:slug', protect, async (req, res) => {
  try {
    await SavedDisease.findOneAndDelete({ userId: req.user._id, diseaseSlug: req.params.slug })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router