import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

import authRoutes from './routes/auth'
import chatRoutes from './routes/chats'
import taskRoutes from './routes/tasks'
import documentRoutes from './routes/documents'
import analyticsRoutes from './routes/analytics'
import userRoutes from './routes/users'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/users', userRoutes)

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`🚀 AI Workspace API running on port ${PORT}`)
})

export default app
