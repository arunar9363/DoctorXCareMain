import mongoose from 'mongoose'

const diseaseSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  slug:             { type: String, required: true, unique: true },
  category:         { type: String, default: 'General' },
  description:      { type: String },
  severity:         { type: String },
  duration:         { type: String },
  contagious:       { type: Boolean, default: false },
  affectedPopulation: String,
  geographicSpread: String,
  onsetPeriod:      String,
  symptoms:         [String],
  stages:           [{ name: String, description: String }],
  treatment:        [String],
  medications:      [{ name: String, dosage: String, description: String }],
  prevention:       [String],
  vaccineInfo:      {
    available:    Boolean,
    name:         String,
    schedule:     String,
    effectiveness: String
  },
  image: String
}, { timestamps: true })

export default mongoose.model('Disease', diseaseSchema)