import API from './axios.js'

// ─── AUTH ROUTES (/api/auth/...) ─────────────────────────────────────────────

// POST /api/auth/register
export const registerAPI = (data) => API.post('/api/auth/register', data)
export const registerUser = registerAPI          // alias used in RegisterPage

// POST /api/auth/login
export const loginAPI    = (data) => API.post('/api/auth/login', data)
export const loginUser   = (email, password) => loginAPI({ email, password })  // alias

// POST /api/auth/google — Google OAuth token verify
export const googleLoginAPI = (googleToken) =>
  API.post('/api/auth/google', { token: googleToken })
export const googleLogin = googleLoginAPI        // alias

// POST /api/auth/forgot-password — sends 6-digit OTP (10 min expiry)
export const forgotPasswordAPI = (email) =>
  API.post('/api/auth/forgot-password', { email })
export const forgotPassword = forgotPasswordAPI  // alias

// POST /api/auth/verify-otp — returns resetToken (JWT)
export const verifyOtpAPI = (email, otp) =>
  API.post('/api/auth/verify-otp', { email, otp })
export const verifyOTP = verifyOtpAPI            // alias

// POST /api/auth/reset-password — requires Bearer resetToken
export const resetPasswordAPI = (newPassword, resetToken) =>
  API.post(
    '/api/auth/reset-password',
    { newPassword },
    { headers: { Authorization: `Bearer ${resetToken}` } }
  )
export const resetPassword = resetPasswordAPI    // alias

// GET /api/auth/me — current user info (protected)
export const getMeAPI = () => API.get('/api/auth/me')

// PUT /api/auth/profile — update profile (protected)
export const updateProfileAPI = (data) => API.put('/api/auth/profile', data)