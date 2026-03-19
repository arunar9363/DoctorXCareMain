import axiosInstance from './axiosInstance'

// Register
export const registerUser = async (userData) => {
  const res = await axiosInstance.post('/auth/register', userData)
  return res.data
}

// Login
export const loginUser = async (email, password) => {
  const res = await axiosInstance.post('/auth/login', { email, password })
  return res.data
}

// Google Login
export const googleLogin = async (token) => {
  const res = await axiosInstance.post('/auth/google', { token })
  return res.data
}

// Forgot Password — send OTP
export const forgotPassword = async (email) => {
  const res = await axiosInstance.post('/auth/forgot-password', { email })
  return res.data
}

// Verify OTP
export const verifyOTP = async (email, otp) => {
  const res = await axiosInstance.post('/auth/verify-otp', { email, otp })
  return res.data
}

// Reset Password
export const resetPassword = async (newPassword, resetToken) => {
  const res = await axiosInstance.post(
    '/auth/reset-password',
    { newPassword },
    { headers: { Authorization: `Bearer ${resetToken}` } }
  )
  return res.data
}

// Get current user
export const getMe = async () => {
  const res = await axiosInstance.get('/auth/me')
  return res.data
}

// Update profile
export const updateProfile = async (profileData) => {
  const res = await axiosInstance.put('/auth/profile', profileData)
  return res.data
}