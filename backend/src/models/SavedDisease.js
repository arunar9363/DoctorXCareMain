import mongoose from 'mongoose'

const savedDiseaseSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diseaseName:      { type: String, required: true },
  diseaseSlug:      { type: String, required: true },
  category:         { type: String, default: 'General' },
  description:      String,
  severity:         String,
  duration:         String,
  contagious:       { type: Boolean, default: false },
  affectedPopulation: String,
  geographicSpread: String,
  onsetPeriod:      String,
  symptoms:         [String],
  stages:           [{ name: String, description: String }],
  treatment:        [String],
  medications:      [{ name: String, dosage: String, description: String }],
  prevention:       [String],
  vaccineInfo: {
    available:     Boolean,
    name:          String,
    schedule:      String,
    effectiveness: String
  },
  image: String,
  notes: { type: String, default: '' }
}, { timestamps: true })

// Ek user ek disease ek baar hi save kar sake
savedDiseaseSchema.index({ userId: 1, diseaseSlug: 1 }, { unique: true })

export default mongoose.model('SavedDisease', savedDiseaseSchema)