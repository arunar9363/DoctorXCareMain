import axiosInstance from './axios'

// Get all feedbacks
export const getFeedbacks = async () => {
  const res = await axiosInstance.get('/feedbacks')
  return res.data
}

// Submit feedback
export const submitFeedback = async (feedbackData) => {
  const res = await axiosInstance.post('/feedbacks', feedbackData)
  return res.data
}