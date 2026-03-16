import express from 'express'
import crypto from 'crypto'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { sendOTPEmail } from '../config/email.js'
import { verifyGoogleToken } from '../config/google.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// ─── REGISTER ────────────────────────────────────────
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender } = req.body

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' })

    const exists = await User.findOne({ email })
    if (exists)
      return res.status(400).json({ error: 'Email already registered' })

    const user = await User.create({
      name, email, password,
      phone, dateOfBirth, gender,
      authProvider: 'local'
    })

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        gender: user.gender,
        avatar: user.avatar
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── LOGIN ───────────────────────────────────────────
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' })

    const user = await User.findOne({ email })
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' })

    if (user.authProvider === 'google')
      return res.status(400).json({ error: 'Please login with Google' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid email or password' })

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        gender: user.gender,
        avatar: user.avatar
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── GOOGLE LOGIN ────────────────────────────────────
// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body
    if (!token)
      return res.status(400).json({ error: 'Google token is required' })

    // Verify Google token
    const payload = await verifyGoogleToken(token)
    const { sub: googleId, email, name, picture } = payload

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] })

    if (!user) {
      user = await User.create({
        name, email, googleId,
        avatar: picture,
        authProvider: 'google',
        isVerified: true
      })
    } else if (!user.googleId) {
      // Existing local user — link Google account
      user.googleId     = googleId
      user.avatar       = picture
      user.authProvider = 'google'
      user.isVerified   = true
      await user.save()
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        gender: user.gender,
        avatar: user.avatar
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'Google authentication failed' })
  }
})

// ─── FORGOT PASSWORD — Send OTP ───────────────────────
// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    // Always return success (security — don't reveal if email exists)
    if (!user)
      return res.json({ success: true, message: 'If email exists, OTP has been sent' })

    // Generate 6 digit OTP
    const otp       = crypto.randomInt(100000, 999999).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    user.resetOtp       = otp
    user.resetOtpExpiry = otpExpiry
    await user.save()

    await sendOTPEmail(email, otp, user.name)

    res.json({ success: true, message: 'OTP sent to your email' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── VERIFY OTP ──────────────────────────────────────
// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ email })
    if (!user)
      return res.status(400).json({ error: 'Invalid request' })

    if (user.resetOtp !== otp)
      return res.status(400).json({ error: 'Invalid OTP' })

    if (user.resetOtpExpiry < new Date())
      return res.status(400).json({ error: 'OTP has expired' })

    // OTP valid — send temp token for reset
    const resetToken = generateToken(user._id)
    res.json({ success: true, resetToken })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── RESET PASSWORD ──────────────────────────────────
// POST /api/auth/reset-password
router.post('/reset-password', protect, async (req, res) => {
  try {
    const { newPassword } = req.body
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const user = await User.findById(req.user._id)
    user.password       = newPassword
    user.resetOtp       = undefined
    user.resetOtpExpiry = undefined
    await user.save()

    res.json({ success: true, message: 'Password reset successful' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── GET CURRENT USER ────────────────────────────────
// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user })
})

// ─── UPDATE PROFILE ──────────────────────────────────
// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, medicalProfile } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, dateOfBirth, gender, medicalProfile },
      { new: true, runValidators: true }
    ).select('-password -resetOtp -resetOtpExpiry')

    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router