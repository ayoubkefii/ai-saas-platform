import { Router, Response } from 'express'
import Groq from 'groq-sdk'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const MODEL = process.env.GROQ_MODEL || 'llama3-70b-8192'

router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, createdAt: true, updatedAt: true, userId: true }
    })
    res.json({ chats })
  } catch {
    res.status(500).json({ error: 'Failed to fetch chats' })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body
    const chat = await prisma.chat.create({
      data: { userId: req.userId!, title: title || 'New Chat' }
    })
    res.status(201).json({ chat })
  } catch {
    res.status(500).json({ error: 'Failed to create chat' })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    })
    if (!chat) return res.status(404).json({ error: 'Chat not found' })
    res.json({ chat })
  } catch {
    res.status(500).json({ error: 'Failed to fetch chat' })
  }
})

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body
    const chat = await prisma.chat.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: { title }
    })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to update chat' })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.chat.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete chat' })
  }
})

router.post('/:id/messages', async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } }
    })
    if (!chat) return res.status(404).json({ error: 'Chat not found' })

    await prisma.message.create({ data: { chatId: chat.id, role: 'user', content } })

    const messages = chat.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    messages.push({ role: 'user', content })

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful, knowledgeable AI assistant. Be concise, accurate, and helpful.' },
        ...messages
      ],
    })

    const assistantContent = completion.choices[0]?.message?.content || ''
    const assistantMsg = await prisma.message.create({
      data: { chatId: chat.id, role: 'assistant', content: assistantContent }
    })

    await prisma.chat.update({ where: { id: chat.id }, data: { updatedAt: new Date() } })
    res.json({ message: assistantMsg })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

router.post('/:id/stream', async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } }
    })
    if (!chat) return res.status(404).json({ error: 'Chat not found' })

    await prisma.message.create({ data: { chatId: chat.id, role: 'user', content } })

    if (chat.title === 'New Chat' && chat.messages.length === 0) {
      const shortTitle = content.slice(0, 50).trim()
      await prisma.chat.update({ where: { id: chat.id }, data: { title: shortTitle } })
    }

    const messages = chat.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    messages.push({ role: 'user', content })

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful, knowledgeable AI assistant. Be concise, accurate, and helpful. Support markdown formatting in your responses.' },
        ...messages
      ],
      stream: true,
    })

    let fullContent = ''

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || ''
      if (delta) {
        fullContent += delta
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()

    await prisma.message.create({ data: { chatId: chat.id, role: 'assistant', content: fullContent } })
    await prisma.chat.update({ where: { id: chat.id }, data: { updatedAt: new Date() } })
  } catch (err) {
    console.error(err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream failed' })
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
      res.end()
    }
  }
})

export default router
