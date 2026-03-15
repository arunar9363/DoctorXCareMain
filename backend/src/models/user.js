import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  phone:    { type: String },
  dateOfBirth: { type: Date },
  gender:   { type: String, enum: ['male', 'female', 'other'] },
  role:     { type: String, enum: ['patient', 'admin'], default: 'patient' },

  // Medical Profile
  medicalProfile: {
    bloodGroup:          { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
    height:              Number,
    weight:              Number,
    existingConditions:  [String],
    allergies:           [String]
  },

  // Google OAuth
  googleId:    { type: String },
  avatar:      { type: String },
  authProvider:{ type: String, enum: ['local', 'google'], default: 'local' },

  // OTP for forgot password
  resetOtp:        { type: String },
  resetOtpExpiry:  { type: Date },

  isVerified:  { type: Boolean, default: false }
}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)