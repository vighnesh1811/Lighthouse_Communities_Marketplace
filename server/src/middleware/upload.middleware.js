import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDirectory = path.resolve(__dirname, '../../uploads/products')
fs.mkdirSync(uploadDirectory, { recursive: true })

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, uploadDirectory),
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase()
    const safeName = path.basename(file.originalname, extension).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    callback(null, `${Date.now()}-${safeName || 'product'}${extension}`)
  },
})

const fileFilter = (_request, file, callback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  callback(null, allowedTypes.includes(file.mimetype))
}

export const productImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})
