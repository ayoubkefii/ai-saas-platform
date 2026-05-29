import { Router, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import pdfParse from 'pdf-parse'
import Groq from 'groq-sdk'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const MODEL = process.env.GROQ_MODEL || 'llama3-70b-8192'

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are allowed'))
  }
})

router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, size: true, type: true, url: true, summary: true, content: true, createdAt: true, userId: true }
    })
    res.json({ documents })
  } catch {
    res.status(500).json({ error: 'Failed to fetch documents' })
  }
})

router.post('/upload', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const fileBuffer = fs.readFileSync(req.file.path)
    let textContent = ''
    try {
      const pdfData = await pdfParse(fileBuffer)
      textContent = (pdfData.text || '').slice(0, 15000)
    } catch (pdfErr) {
      console.error('PDF parse error:', pdfErr)
      textContent = ''
    }

    let summary = ''
    if (textContent.trim().length > 100) {
      try {
        const summaryResponse = await groq.chat.completions.create({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert document analyst. Create a concise, structured summary of the provided document. Use markdown formatting with headers, bullet points, and key highlights.'
            },
            {
              role: 'user',
              content: `Please analyze and summarize this document:\n\n${textContent}`
            }
          ],
          max_tokens: 1000,
        })
        summary = summaryResponse.choices[0]?.message?.content || ''
      } catch (groqErr) {
        console.error('Groq summary error:', groqErr)
        summary = 'Summary generation failed. You can still ask questions about this document.'
      }
    } else {
      summary = 'Could not extract text from this PDF. The file may be image-based or encrypted.'
    }

    const document = await prisma.document.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        url: `/uploads/${req.file.filename}`,
        content: textContent,
        summary,
        userId: req.userId!
      }
    })

    res.status(201).json({ document })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Upload failed' })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId }
    })
    if (!doc) return res.status(404).json({ error: 'Document not found' })
    res.json({ document: doc })
  } catch {
    res.status(500).json({ error: 'Failed to fetch document' })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId }
    })
    if (!doc) return res.status(404).json({ error: 'Document not found' })

    const filePath = path.join(__dirname, '../..', doc.url)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    await prisma.document.delete({ where: { id: doc.id } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete document' })
  }
})

router.post('/:id/ask', async (req: AuthRequest, res: Response) => {
  try {
    const { question } = req.body
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId }
    })
    if (!doc) return res.status(404).json({ error: 'Document not found' })
    if (!doc.content) return res.status(400).json({ error: 'Document has no extractable text content' })

    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert document analyst. Answer questions about the following document content accurately and concisely. Use markdown formatting when appropriate.\n\nDocument: "${doc.name}"\n\nContent:\n${doc.content}`
        },
        { role: 'user', content: question }
      ],
      max_tokens: 1500,
    })
    const answer = response.choices[0]?.message?.content || ''
    res.json({ answer })
  } catch {
    res.status(500).json({ error: 'Failed to get answer' })
  }
})

router.post('/:id/stream-ask', async (req: AuthRequest, res: Response) => {
  try {
    const { question } = req.body
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId }
    })
    if (!doc) return res.status(404).json({ error: 'Document not found' })
    if (!doc.content) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'This document has no extractable text. It may be image-based or encrypted.' } }] })}

`)
      res.write('data: [DONE]\n\n')
      res.end()
      return
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert document analyst. Answer questions about the following document accurately and concisely. Use markdown formatting.\n\nDocument: "${doc.name}"\n\nContent:\n${doc.content}`
        },
        { role: 'user', content: question }
      ],
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || ''
      if (delta) {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
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
