import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'

import authRoutes           from './routes/auth.routes.js'
import userRoutes           from './routes/user.routes.js'
import infermedicaRoutes    from './routes/Infermedica.routes.js'
import chatRoutes           from './routes/chat.routes.js'
import diseaseRoutes        from './routes/disease.routes.js'
import feedbackRoutes       from './routes/feedback.routes.js'
import savedDiseaseRoutes   from './routes/savedDisease.routes.js'
import labReportRoutes      from './routes/labReport.routes.js'
import healthTrackingRoutes from './routes/healthTracking.routes.js'
import assessmentRoutes     from './routes/assessment.routes.js'

dotenv.config()
connectDB()

const app = express()

// ✅ app.use() — not (express()).use()
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use('/api/auth',            authRoutes)
app.use('/api/users',           userRoutes)
app.use('/api/infermedica',     infermedicaRoutes)
app.use('/api/chat',            chatRoutes)
app.use('/api/diseases',        diseaseRoutes)
app.use('/api/feedbacks',       feedbackRoutes)
app.use('/api/saved-diseases',  savedDiseaseRoutes)
app.use('/api/lab-reports',     labReportRoutes)
app.use('/api/health-tracking', healthTrackingRoutes)
app.use('/api/assessments',     assessmentRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app