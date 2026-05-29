import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    })
    res.json({ tasks })
  } catch {
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required' })
    const task = await prisma.task.create({
      data: {
        title, description, status: status || 'todo',
        priority: priority || 'medium', userId: req.userId!,
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    })
    res.status(201).json({ task })
  } catch {
    res.status(500).json({ error: 'Failed to create task' })
  }
})

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, priority, dueDate, order } = req.body
    const task = await prisma.task.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(order !== undefined && { order }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      }
    })
    const updated = await prisma.task.findFirst({ where: { id: req.params.id } })
    res.json({ task: updated })
  } catch {
    res.status(500).json({ error: 'Failed to update task' })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.task.deleteMany({ where: { id: req.params.id, userId: req.userId } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

router.post('/reorder', async (req: AuthRequest, res: Response) => {
  try {
    const { tasks } = req.body
    await Promise.all(
      tasks.map((t: { id: string; status: string; order: number }) =>
        prisma.task.updateMany({
          where: { id: t.id, userId: req.userId },
          data: { status: t.status, order: t.order }
        })
      )
    )
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to reorder tasks' })
  }
})

export default router
