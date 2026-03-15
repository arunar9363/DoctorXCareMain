import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Disease from './Disease.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../.env') })

await mongoose.connect(process.env.MONGO_URI)

// disease.json is in src/models/ folder
const diseases = JSON.parse(
  readFileSync(join(__dirname, './disease.json'), 'utf-8')
)

for (const d of diseases) {
  await Disease.findOneAndUpdate(
    { slug: d.slug || d.name.toLowerCase().replace(/\s+/g, '-') },
    { ...d, slug: d.slug || d.name.toLowerCase().replace(/\s+/g, '-') },
    { upsert: true, new: true }
  )
}

console.log(`Seeded ${diseases.length} diseases`)
await mongoose.disconnect()