import axiosInstance from './axios'

// Get profile
export const getUserProfile = async () => {
  const res = await axiosInstance.get('/users/profile')
  return res.data
}

// Update profile
export const updateUserProfile = async (profileData) => {
  const res = await axiosInstance.put('/users/profile', profileData)
  return res.data
}

// Delete account
export const deleteAccount = async () => {
  const res = await axiosInstance.delete('/users/account')
  return res.data
}