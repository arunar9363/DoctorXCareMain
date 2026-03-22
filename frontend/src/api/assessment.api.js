import API from './axios.js'

// GET /api/assessments/:id — fetch single assessment
export const getAssessmentByIdAPI = (id) => API.get(`/api/assessments/${id}`)

// POST /api/assessments — create new assessment
export const createAssessmentAPI = (data) => API.post('/api/assessments', data)

// DELETE /api/assessments/:id — delete assessment
export const deleteAssessmentAPI = (id) => API.delete(`/api/assessments/${id}`)

// GET /api/assessments/stats — fetch assessment stats for dashboard
export const getAssessmentStatsAPI = () => API.get('/api/assessments/stats')