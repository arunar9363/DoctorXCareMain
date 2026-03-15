import express from 'express'
import LabReport from '../models/LabReport.js'
import { protect } from '../middleware/auth.js'
const router = express.Router()

// GET /api/lab-reports — user ke saare reports
router.get('/', protect, async (req, res) => {
  try {
    const reports = await LabReport.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json(reports)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/lab-reports — naya report save karo
router.post('/', protect, async (req, res) => {
  try {
    const report = await LabReport.create({ ...req.body, userId: req.user._id })
    res.status(201).json(report)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/lab-reports/:id — single report
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await LabReport.findOne({ _id: req.params.id, userId: req.user._id })
    if (!report) return res.status(404).json({ error: 'Report not found' })
    res.json(report)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/lab-reports/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await LabReport.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router