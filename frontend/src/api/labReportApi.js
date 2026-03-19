import axiosInstance from './axiosInstance'

// Get all lab reports
export const getLabReports = async () => {
  const res = await axiosInstance.get('/lab-reports')
  return res.data
}

// Save lab report
export const saveLabReport = async (reportData) => {
  const res = await axiosInstance.post('/lab-reports', reportData)
  return res.data
}

// Get single report
export const getLabReportById = async (id) => {
  const res = await axiosInstance.get(`/lab-reports/${id}`)
  return res.data
}

// Delete report
export const deleteLabReport = async (id) => {
  const res = await axiosInstance.delete(`/lab-reports/${id}`)
  return res.data
}