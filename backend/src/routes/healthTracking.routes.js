import express from 'express'
import HealthTracking from '../models/HealthTracking.js'
import { protect } from '../middleware/auth.js'
const router = express.Router()

// GET /api/health-tracking — user ke saari conditions
router.get('/', protect, async (req, res) => {
  try {
    const data = await HealthTracking.find({ userId: req.user._id })
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/health-tracking/:condition — specific condition ka data
router.get('/:condition', protect, async (req, res) => {
  try {
    const data = await HealthTracking.findOne({
      userId: req.user._id,
      condition: req.params.condition
    })
    // Pichla data milega, agar nahi hai toh empty
    res.json(data || { condition: req.params.condition, metrics: [], chartData: [] })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/health-tracking — naya metric add karo (upsert)
router.post('/', protect, async (req, res) => {
  try {
    const { condition, metric, chartData } = req.body
    const updated = await HealthTracking.findOneAndUpdate(
      { userId: req.user._id, condition },
      {
        $push: metric ? { metrics: metric } : {},
        $set: {
          chartData: chartData || [],
          lastUpdated: new Date()
        }
      },
      { upsert: true, new: true }
    )
    res.json(updated)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router