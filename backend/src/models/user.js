import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String },
  phone:       { type: String },
  dateOfBirth: { type: Date },
  gender:      { type: String, enum: ['male', 'female', 'other'] },
  role:        { type: String, enum: ['patient', 'admin'], default: 'patient' },

  medicalProfile: {
    bloodGroup:         { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
    height:             Number,
    weight:             Number,
    existingConditions: [String],
    allergies:          [String]
  },

  googleId:     { type: String },
  avatar:       { type: String },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

  resetOtp:       { type: String },
  resetOtpExpiry: { type: Date },
  isVerified:     { type: Boolean, default: false }
}, { timestamps: true })

// bcryptjs v2 style — no next callback
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)