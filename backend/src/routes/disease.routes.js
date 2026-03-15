import express from 'express'
import { getAllDiseases, getDiseaseBySlug, searchDiseases } from '../services/disease.service.js'
const router = express.Router()

router.get('/',        async (req, res) => {
  try {
    const { q, category } = req.query
    if (q)        return res.json(await searchDiseases(q))
    res.json(await getAllDiseases())
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:slug',  async (req, res) => {
  try {
    const disease = await getDiseaseBySlug(req.params.slug)
    if (!disease) return res.status(404).json({ error: 'Disease not found' })
    res.json(disease)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router