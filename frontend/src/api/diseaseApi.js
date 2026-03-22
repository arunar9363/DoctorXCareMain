import axiosInstance from './axios'

// Get all diseases
export const getAllDiseases = async () => {
  const res = await axiosInstance.get('/diseases')
  return res.data
}

// Search diseases
export const searchDiseases = async (query) => {
  const res = await axiosInstance.get(`/diseases?q=${query}`)
  return res.data
}

// Get disease by slug
export const getDiseaseBySlug = async (slug) => {
  const res = await axiosInstance.get(`/diseases/${slug}`)
  return res.data
}
