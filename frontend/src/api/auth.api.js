import API from './axios.js'

// ─── AUTH ROUTES (/api/auth/...) ─────────────────────────────────────────────
// NOTE: axios.js baseURL is already 'http://localhost:5000/api'
// So all URLs here must NOT include '/api' prefix

// POST /api/auth/register
export const registerAPI = (data) => API.post('/auth/register', data)
export const registerUser = registerAPI          // alias used in RegisterPage

// POST /api/auth/login
export const loginAPI    = (data) => API.post('/auth/login', data)
export const loginUser   = (email, password) => loginAPI({ email, password })  // alias

// POST /api/auth/google — Google OAuth token verify
export const googleLoginAPI = (googleToken) =>
  API.post('/auth/google', { token: googleToken })
export const googleLogin = googleLoginAPI        // alias

// POST /api/auth/forgot-password — sends 6-digit OTP (10 min expiry)
export const forgotPasswordAPI = (email) =>
  API.post('/auth/forgot-password', { email })
export const forgotPassword = forgotPasswordAPI  // alias

// POST /api/auth/verify-otp — returns resetToken (JWT)
export const verifyOtpAPI = (email, otp) =>
  API.post('/auth/verify-otp', { email, otp })
export const verifyOTP = verifyOtpAPI            // alias

// POST /api/auth/reset-password — requires Bearer resetToken
export const resetPasswordAPI = (newPassword, resetToken) =>
  API.post(
    '/auth/reset-password',
    { newPassword },
    { headers: { Authorization: `Bearer ${resetToken}` } }
  )
export const resetPassword = resetPasswordAPI    // alias

// GET /api/auth/me — current user info (protected)
export const getMeAPI = () => API.get('/auth/me')

// PUT /api/auth/profile — update profile (protected)
export const updateProfileAPI = (data) => API.put('/auth/profile', data)