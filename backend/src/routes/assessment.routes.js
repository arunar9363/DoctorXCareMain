// backend/src/routes/assessment.routes.js
import express from 'express'
import Assessment from '../models/Assessment.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// GET /api/assessments/stats — must be before /:id
router.get('/stats', protect, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id }).sort({ createdAt: -1 })
    const stats = {
      totalAssessments: assessments.length,
      lastAssessment:   assessments[0]?.createdAt || null,
      triageLevels: assessments.reduce((acc, a) => {
        acc[a.triageLevel] = (acc[a.triageLevel] || 0) + 1
        return acc
      }, {})
    }
    res.json(stats)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/assessments
router.get('/', protect, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(assessments)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/assessments
router.post('/', protect, async (req, res) => {
  try {
    const assessment = await Assessment.create({ ...req.body, userId: req.user._id })
    res.status(201).json(assessment)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/assessments/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ _id: req.params.id, userId: req.user._id })
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' })
    res.json(assessment)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/assessments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Assessment.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router