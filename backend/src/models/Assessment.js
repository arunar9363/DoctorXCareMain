import mongoose from 'mongoose'

const assessmentSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName:      { type: String, default: 'Anonymous' },
  age:              Number,
  sex:              String,
  symptoms:         [String],
  conditions:       [mongoose.Schema.Types.Mixed],
  triageLevel:      String,
  triageDescription: String,
  recommendations:  [String],
  evidenceCount:    { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('Assessment', assessmentSchema)