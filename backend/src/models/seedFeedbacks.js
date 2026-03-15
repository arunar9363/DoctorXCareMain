// src/scripts/seedFeedbacks.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import Feedback from '../models/Feedback.js'

dotenv.config()
await mongoose.connect(process.env.MONGO_URI)

const feedbacks = JSON.parse(readFileSync('./feedbacks.json', 'utf-8'))
await Feedback.insertMany(feedbacks.map(({ name, message, type, reply }) => ({ name, message, type, reply })))
console.log(`Seeded ${feedbacks.length} feedbacks`)
await mongoose.disconnect()