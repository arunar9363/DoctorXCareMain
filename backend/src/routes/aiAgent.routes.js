import express from 'express'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET || 'doctorxcare_secret'

// Helper: forward request to Python AI service
async function proxyToAI(path, method = 'POST', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-backend-secret': AI_SERVICE_SECRET
    }
  }
  if (body) options.body = JSON.stringify(body)

  const response = await fetch(`${AI_SERVICE_URL}${path}`, options)
  const text = await response.text()

  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = { raw: text }
  }

  return { status: response.status, data }
}

// ── GET /api/ai/health — AI service health check ─────────────────
router.get('/health', async (req, res) => {
  try {
    const { status, data } = await proxyToAI('/health', 'GET')
    res.status(status).json(data)
  } catch (err) {
    res.status(503).json({ error: 'AI service unavailable', detail: err.message })
  }
})

// ── POST /api/ai/lab/analyze — Analyze lab report text ───────────
router.post('/lab/analyze', protect, async (req, res) => {
  try {
    const { status, data } = await proxyToAI('/lab/analyze', 'POST', req.body)
    res.status(status).json(data)
  } catch (err) {
    res.status(503).json({ error: 'AI service unavailable', detail: err.message })
  }
})

// ── POST /api/ai/tracking/analyze — Analyze health tracking data ─
router.post('/tracking/analyze', protect, async (req, res) => {
  try {
    const { status, data } = await proxyToAI('/tracking/analyze', 'POST', req.body)
    res.status(status).json(data)
  } catch (err) {
    res.status(503).json({ error: 'AI service unavailable', detail: err.message })
  }
})

// ── POST /api/ai/tracking/extract — Extract data from report text ─
router.post('/tracking/extract', protect, async (req, res) => {
  try {
    const { status, data } = await proxyToAI('/tracking/extract', 'POST', req.body)
    res.status(status).json(data)
  } catch (err) {
    res.status(503).json({ error: 'AI service unavailable', detail: err.message })
  }
})

// ── POST /api/ai/tracking/trends — Get trend insights ────────────
router.post('/tracking/trends', protect, async (req, res) => {
  try {
    const { status, data } = await proxyToAI('/tracking/trends', 'POST', req.body)
    res.status(status).json(data)
  } catch (err) {
    res.status(503).json({ error: 'AI service unavailable', detail: err.message })
  }
})

// ── POST /api/ai/doctor/nearby — Find nearby hospitals ───────────
router.post('/doctor/nearby', protect, async (req, res) => {
  try {
    const { status, data } = await proxyToAI('/doctor/nearby', 'POST', req.body)
    res.status(status).json(data)
  } catch (err) {
    res.status(503).json({ error: 'AI service unavailable', detail: err.message })
  }
})

// ── GET /api/ai/doctor/details/:placeId — Get hospital details ───
router.get('/doctor/details/:placeId', protect, async (req, res) => {
  try {
    const { status, data } = await proxyToAI(
      `/doctor/details/${req.params.placeId}`, 'GET'
    )
    res.status(status).json(data)
  } catch (err) {
    res.status(503).json({ error: 'AI service unavailable', detail: err.message })
  }
})

export default router
