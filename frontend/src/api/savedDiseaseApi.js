import axiosInstance from './axios'

// Get all saved diseases
export const getSavedDiseases = async () => {
  const res = await axiosInstance.get('/saved-diseases')
  return res.data
}

// Save a disease
export const saveDisease = async (diseaseData) => {
  const res = await axiosInstance.post('/saved-diseases', diseaseData)
  return res.data
}

// Check if disease is saved
export const checkIfSaved = async (slug) => {
  const res = await axiosInstance.get(`/saved-diseases/check/${slug}`)
  return res.data
}

// Update notes
export const updateDiseaseNotes = async (slug, notes) => {
  const res = await axiosInstance.patch(`/saved-diseases/${slug}`, { notes })
  return res.data
}

// Delete saved disease
export const removeSavedDisease = async (slug) => {
  const res = await axiosInstance.delete(`/saved-diseases/${slug}`)
  return res.data
}