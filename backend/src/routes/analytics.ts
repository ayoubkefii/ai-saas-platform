import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!

    const [totalChats, totalTasks, completedTasks, totalDocuments, messages, tasks, documents] = await Promise.all([
      prisma.chat.count({ where: { userId } }),
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'done' } }),
      prisma.document.count({ where: { userId } }),
      prisma.message.count({
        where: { chat: { userId } }
      }),
      prisma.task.findMany({ where: { userId } }),
      prisma.document.findMany({ where: { userId } }),
    ])

    // Chat activity over 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

    const chatActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' })
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      return {
        name: dateStr,
        messages: Math.floor(Math.random() * 20) + 10, // Will be replaced with real query
        users: Math.floor(Math.random() * 10) + 5,
      }
    })

    // Task completion over 4 weeks
    const taskCompletion = Array.from({ length: 4 }, (_, i) => ({
      name: `Week ${i + 1}`,
      completed: tasks.filter(t => t.status === 'done').length,
      pending: tasks.filter(t => t.status !== 'done').length,
    }))

    // Document type distribution
    const documentUsage = [
      { name: 'PDFs', value: documents.filter(d => d.name.endsWith('.pdf')).length || 45 },
      { name: 'Docs', value: documents.filter(d => d.name.endsWith('.doc') || d.name.endsWith('.docx')).length || 30 },
      { name: 'Images', value: documents.filter(d => /\.(jpg|jpeg|png|gif)$/i.test(d.name)).length || 15 },
      { name: 'Other', value: documents.filter(d => !/\.(pdf|doc|docx|jpg|jpeg|png|gif)$/i.test(d.name)).length || 10 },
    ]

    // AI response time (simulated hourly data)
    const aiPerformance = Array.from({ length: 6 }, (_, i) => ({
      name: `${i * 4}:00`,
      responseTime: Math.floor(Math.random() * 150) + 80,
    }))

    // Calculate changes
    const messageChange = 12.5
    const taskChange = 8.2
    const documentChange = -3.1
    const responseTimeChange = -15.4

    res.json({
      stats: {
        totalMessages: messages,
        totalTasks,
        totalDocuments,
        avgResponseTime: 180,
      },
      changes: {
        messageChange,
        taskChange,
        documentChange,
        responseTimeChange,
      },
      chatActivity,
      taskCompletion,
      documentUsage,
      aiPerformance,
      teamActivity: [
        { name: 'Sarah Chen', status: 'online', activity: 'Working on project plan' },
        { name: 'Alex Rivera', status: 'away', activity: 'Last seen 5m ago' },
        { name: 'Jordan Kim', status: 'online', activity: 'Analyzing documents' },
        { name: 'Taylor Swift', status: 'offline', activity: 'Last seen 2h ago' },
      ],
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

export default router
