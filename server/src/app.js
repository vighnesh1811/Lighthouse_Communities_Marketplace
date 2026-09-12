import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import catalogRouter from './routes/catalog.routes.js'
import healthRouter from './routes/health.routes.js'
import orderRouter from './routes/order.routes.js'
import adminRouter from './routes/admin.routes.js'
import managementRouter from './routes/management.routes.js'
import trackingRouter from './routes/tracking.routes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))
app.use('/api/health', healthRouter)
app.use('/api', catalogRouter)
app.use('/api', orderRouter)
app.use('/api', adminRouter)
app.use('/api/admin', managementRouter)
app.use('/api', trackingRouter)

app.use((error, _request, response, _next) => {
  void _next
  console.error(error)
  response.status(500).json({ message: 'Something went wrong on the server.' })
})

export default app
