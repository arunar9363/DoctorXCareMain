import axios from 'axios'

const AI_BASE = import.meta.env.VITE_AI_URL || 'http://localhost:8000'
const BACKEND_SECRET = import.meta.env.VITE_BACKEND_SECRET || 'doctorxcare_secret'

const aiAxios = axios.create({
  baseURL: AI_BASE,
  headers: {
    'Content-Type': 'application/json',
    'x-backend-secret': BACKEND_SECRET,
  },
})

// ── LAB REPORT ANALYSIS (text) ──────────────────────
export const analyzeLabReport = async (reportData) => {
  const res = await aiAxios.post('/lab/analyze', reportData)
  return res.data
}

// ── LAB REPORT ANALYSIS (image) ─────────────────────
export const analyzeLabImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await aiAxios.post('/lab/analyze-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'x-backend-secret': BACKEND_SECRET,
    },
  })
  return res.data
}

// ── HEALTH TRACKING ANALYSIS ─────────────────────────
export const analyzeHealthTracking = async (trackingData) => {
  const res = await aiAxios.post('/tracking/analyze', trackingData)
  return res.data
}

// ── EXTRACT DATA FROM REPORT ─────────────────────────
export const extractReportData = async (reportText, reportType = 'general') => {
  const res = await aiAxios.post('/tracking/extract', {
    report_text: reportText,
    report_type: reportType,
  })
  return res.data
}

// ── FIND NEARBY DOCTORS ──────────────────────────────
export const findNearbyDoctors = async (lat, lng, facilityType = 'hospital', radius = 5000) => {
  const res = await aiAxios.post('/doctor/nearby', {
    latitude: lat,
    longitude: lng,
    facility_type: facilityType,
    radius,
  })
  return res.data
}

// ── GET PLACE DETAILS ────────────────────────────────
export const getPlaceDetails = async (placeId) => {
  const res = await aiAxios.get(`/doctor/details/${placeId}`)
  return res.data
}

// ── AI HEALTH CHECK ──────────────────────────────────
export const checkAIHealth = async () => {
  const res = await aiAxios.get('/health')
  return res.data
}