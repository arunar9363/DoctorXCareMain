import axiosInstance from './axiosInstance'

// Get symptoms (search or all)
export const getSymptoms = async (query = '', age = 25) => {
  const params = query ? `?q=${query}&age=${age}` : `?age=${age}`
  const res = await axiosInstance.get(`/infermedica/symptoms${params}`)
  return res.data
}

// Get diagnosis
export const getDiagnosis = async (payload) => {
  const res = await axiosInstance.post('/infermedica/diagnosis', payload)
  return res.data
}

// Get triage
export const getTriage = async (payload) => {
  const res = await axiosInstance.post('/infermedica/triage', payload)
  return res.data
}

// Get risk factors
export const getRiskFactors = async (age = 25) => {
  const res = await axiosInstance.get(`/infermedica/risk-factors?age=${age}`)
  return res.data
}

// Save assessment to MongoDB
export const saveAssessment = async (assessmentData) => {
  const res = await axiosInstance.post('/assessments', assessmentData)
  return res.data
}