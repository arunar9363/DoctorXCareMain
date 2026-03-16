import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -resetOtp -resetOtpExpiry')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/users/profile
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

// DELETE /api/users/account
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id)
    res.json({ success: true, message: 'Account deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router