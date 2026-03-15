import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Feedback from './Feedback.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../.env') })

await mongoose.connect(process.env.MONGO_URI)

const feedbacks = JSON.parse(
  readFileSync(join(__dirname, './feedback.json'), 'utf-8')
)

await Feedback.insertMany(
  feedbacks.map(({ name, message, type, reply }) => ({ name, message, type, reply }))
)

console.log(`Seeded ${feedbacks.length} feedbacks`)
await mongoose.disconnect()