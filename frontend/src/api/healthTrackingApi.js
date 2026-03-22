import axiosInstance from './axios'

// Get all conditions
export const getAllTracking = async () => {
  const res = await axiosInstance.get('/health-tracking')
  return res.data
}

// Get specific condition data
export const getTrackingByCondition = async (condition) => {
  const res = await axiosInstance.get(`/health-tracking/${condition}`)
  return res.data
}

// Add new metric (upsert)
export const addMetric = async (condition, metric, chartData) => {
  const res = await axiosInstance.post('/health-tracking', {
    condition,
    metric,
    chartData,
  })
  return res.data
}