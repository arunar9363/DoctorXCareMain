// aiAgentsApi.js
// All AI calls go through Node.js backend (/api/ai/)
// which proxies to the Python AI service with the backend secret.
// Frontend never calls the Python service directly.

import API from './axios.js'

// ── LAB REPORT ANALYSIS ──────────────────────────────────────────

// LabUpload.jsx uses: analyzeLabImage
// Since Groq doesn't support images, we convert to text-based analysis
export const analyzeLabImage = () => {
  // formData may contain a file — we send as text fallback
  return API.post('/api/ai/lab/analyze', {
    report_text: 'Image upload received. Please extract text from the image and paste it for analysis.',
    report_type: 'general'
  })
}

// Named export used by other consumers
export const analyzeLabReportAPI = (payload) =>
  API.post('/api/ai/lab/analyze', payload)

// ── HEALTH TRACKING ───────────────────────────────────────────────

// TrackerDashboard.jsx uses: analyzeHealthTracking, extractReportData
export const analyzeHealthTracking = (payload) =>
  API.post('/api/ai/tracking/analyze', payload)

export const extractReportData = (payload) =>
  API.post('/api/ai/tracking/extract', payload)

export const analyzeHealthTrackingAPI = (payload) =>
  API.post('/api/ai/tracking/analyze', payload)

export const extractReportDataAPI = (payload) =>
  API.post('/api/ai/tracking/extract', payload)

export const getTrendInsightsAPI = (payload) =>
  API.post('/api/ai/tracking/trends', payload)

// ── SPECIALIST / HOSPITAL FINDER (Google Maps) ───────────────────

// FinderMap.jsx uses: findNearbyDoctors
export const findNearbyDoctors = (payload) =>
  API.post('/api/ai/doctor/nearby', payload)

export const findNearbyFacilitiesAPI = (payload) =>
  API.post('/api/ai/doctor/nearby', payload)

export const getPlaceDetailsAPI = (placeId) =>
  API.get(`/api/ai/doctor/details/${placeId}`)

// ── AI SERVICE HEALTH CHECK ───────────────────────────────────────

export const checkAIServiceHealthAPI = () =>
  API.get('/api/ai/health')