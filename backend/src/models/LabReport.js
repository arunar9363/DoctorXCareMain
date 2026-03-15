import mongoose from 'mongoose'

const labReportSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl:    { type: String },           // Cloudinary ya direct upload URL
  fileName:   String,
  reportType: { type: String, enum: ['CBC', 'LFT', 'KFT', 'THYROID', 'SUGAR', 'OTHER'], default: 'OTHER' },
  analysis: {
    summary:     String,
    findings:    [String],
    suggestions: [String],
    rawText:     String                   // AI ka raw response
  },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model('LabReport', labReportSchema)