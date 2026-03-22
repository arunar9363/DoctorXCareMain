import API from './axios.js'

// GET /api/assessments — fetch all assessments for logged-in user
export const getAssessmentsAPI = () => API.get('/assessments')

// GET /api/assessments/:id — fetch single assessment
export const getAssessmentByIdAPI = (id) => API.get(`/assessments/${id}`)

// POST /api/assessments — create new assessment
export const createAssessmentAPI = (data) => API.post('/assessments', data)

// DELETE /api/assessments/:id — delete assessment
export const deleteAssessmentAPI = (id) => API.delete(`/assessments/${id}`)

// GET /api/assessments/stats — get assessment statistics
export const getAssessmentStatsAPI = () => API.get('/assessments/stats')