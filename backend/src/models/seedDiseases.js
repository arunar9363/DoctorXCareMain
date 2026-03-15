import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import Disease from '../models/Disease.js'

dotenv.config()
await mongoose.connect(process.env.MONGO_URI)

const diseases = JSON.parse(readFileSync('./diseases.json', 'utf-8'))

for (const d of diseases) {
  await Disease.findOneAndUpdate(
    { slug: d.slug || d.name.toLowerCase().replace(/\s+/g, '-') },
    { ...d, slug: d.slug || d.name.toLowerCase().replace(/\s+/g, '-') },
    { upsert: true, new: true }
  )
}
console.log(`Seeded ${diseases.length} diseases`)
await mongoose.disconnect()