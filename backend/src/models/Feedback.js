import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['compliment', 'general', 'feature_request', 'bug'], default: 'general' },
  reply: {
    from:    String,
    message: String
  }
}, { timestamps: true })

export default mongoose.model('Feedback', feedbackSchema)