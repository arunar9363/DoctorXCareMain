import mongoose from 'mongoose'

const metricSchema = new mongoose.Schema({
  date:  { type: Date, default: Date.now },
  value: mongoose.Schema.Types.Mixed,     // BP: "120/80", sugar: 95, weight: 70
  unit:  String,
  note:  String
}, { _id: false })

const healthTrackingSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  condition: { type: String, required: true },  // "diabetes", "hypertension", etc.
  metrics:   [metricSchema],
  chartData: [mongoose.Schema.Types.Mixed],     // Charts.jsx ke liye processed data
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true })

// Ek user, ek condition = ek document
healthTrackingSchema.index({ userId: 1, condition: 1 }, { unique: true })

export default mongoose.model('HealthTracking', healthTrackingSchema)