import express from 'express'
const router = express.Router()

const API_URL = "https://api.infermedica.com/v3"

function getHeaders() {
  return {
    "App-Id": process.env.INFERMEDICA_APP_ID,
    "App-Key": process.env.INFERMEDICA_APP_KEY,
    "Content-Type": "application/json",
    "Interview-Id": `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

function normalizeAgeUnit(unit) {
  if (unit === "years") return "year"
  if (unit === "months") return "month"
  return unit || "year"
}

// GET /api/infermedica/health
router.get('/health', (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    credentials: {
      APP_ID: process.env.INFERMEDICA_APP_ID ? "✓" : "✗",
      APP_KEY: process.env.INFERMEDICA_APP_KEY ? "✓" : "✗"
    }
  })
})

// GET /api/infermedica/info
router.get('/info', async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/info`, { headers: getHeaders() })
    if (!response.ok) return res.status(response.status).json({ error: await response.text() })
    res.json(await response.json())
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch API info' })
  }
})

// GET /api/infermedica/symptoms
router.get('/symptoms', async (req, res) => {
  try {
    const { q, age = "25", language = "en" } = req.query
    if (q) {
      const payload = {
        phrase: q,
        sex: "male",
        age: { value: parseInt(age), unit: "year" },
        max_results: 10
      }
      const response = await fetch(`${API_URL}/suggest`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      })
      if (!response.ok) return res.status(response.status).json({ error: await response.text() })
      const data = await response.json()
      return res.json(data.filter(item => item.type === 'symptom'))
    } else {
      const response = await fetch(`${API_URL}/symptoms?age.value=${age}&language=${language}`, {
        headers: getHeaders()
      })
      if (!response.ok) return res.status(response.status).json({ error: await response.text() })
      return res.json(await response.json())
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch symptoms' })
  }
})

// POST /api/infermedica/diagnosis
router.post('/diagnosis', async (req, res) => {
  try {
    if (!req.body.sex || !req.body.age)
      return res.status(400).json({ error: "sex and age are required" })

    let ageValue, ageUnit
    if (typeof req.body.age === 'object') {
      ageValue = parseInt(req.body.age.value)
      ageUnit  = normalizeAgeUnit(req.body.age.unit)
    } else {
      ageValue = parseInt(req.body.age) || 30
      ageUnit  = "year"
    }

    const payload = {
      sex: req.body.sex,
      age: { value: ageValue, unit: ageUnit },
      evidence: req.body.evidence || [],
      extras: { disable_groups: false }
    }

    const response = await fetch(`${API_URL}/diagnosis`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    })
    const text = await response.text()
    if (!response.ok) return res.status(response.status).json({ error: text })
    res.json(JSON.parse(text))
  } catch (err) {
    res.status(500).json({ error: 'Failed to get diagnosis' })
  }
})

// POST /api/infermedica/triage
router.post('/triage', async (req, res) => {
  try {
    if (!req.body.sex || !req.body.age)
      return res.status(400).json({ error: "sex and age are required" })

    let ageValue, ageUnit
    if (typeof req.body.age === 'object') {
      ageValue = parseInt(req.body.age.value)
      ageUnit  = normalizeAgeUnit(req.body.age.unit)
    } else {
      ageValue = parseInt(req.body.age) || 30
      ageUnit  = "year"
    }

    const payload = {
      sex: req.body.sex,
      age: { value: ageValue, unit: ageUnit },
      evidence: req.body.evidence || [],
      extras: { disable_groups: false }
    }

    const response = await fetch(`${API_URL}/triage`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    })
    const text = await response.text()
    if (!response.ok) return res.status(response.status).json({ error: text })
    res.json(JSON.parse(text))
  } catch (err) {
    res.status(500).json({ error: 'Failed to get triage' })
  }
})

// GET /api/infermedica/risk-factors
router.get('/risk-factors', async (req, res) => {
  try {
    const { language = "en", age = "25" } = req.query
    const response = await fetch(
      `${API_URL}/risk_factors?age.value=${age}&language=${language}`,
      { headers: getHeaders() }
    )
    if (!response.ok) return res.status(response.status).json({ error: await response.text() })
    res.json(await response.json())
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch risk factors' })
  }
})

export default router