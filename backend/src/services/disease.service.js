import Disease from '../models/Disease.js'
import Assessment from '../models/Assessment.js'

// ===== DISEASES =====
export const getAllDiseases = () => Disease.find().sort({ name: 1 })

export const getDiseaseBySlug = (slug) => Disease.findOne({ slug })

export const searchDiseases = (query) =>
  Disease.find({ $or: [
    { name:        { $regex: query, $options: 'i' } },
    { symptoms:    { $regex: query, $options: 'i' } },
    { description: { $regex: query, $options: 'i' } }
  ]})

export const getDiseasesByCategory = (category) =>
  Disease.find({ category: { $regex: category, $options: 'i' } })

// ===== ASSESSMENTS (replaces saveAssessmentToFirebase) =====
export const saveAssessment = (userId, data) =>
  Assessment.create({ userId, ...data })

export const getAssessmentHistory = (userId, limit = 50) =>
  Assessment.find({ userId }).sort({ createdAt: -1 }).limit(limit)

export const getAssessmentById = (assessmentId, userId) =>
  Assessment.findOne({ _id: assessmentId, userId })

export const deleteAssessment = (assessmentId, userId) =>
  Assessment.findOneAndDelete({ _id: assessmentId, userId })

export const getAssessmentStats = async (userId) => {
  const assessments = await getAssessmentHistory(userId)
  return {
    totalAssessments: assessments.length,
    lastAssessment:   assessments[0]?.createdAt || null,
    triageLevels: assessments.reduce((acc, a) => {
      acc[a.triageLevel] = (acc[a.triageLevel] || 0) + 1
      return acc
    }, {})
  }
}