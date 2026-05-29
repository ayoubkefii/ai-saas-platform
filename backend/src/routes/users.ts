import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, plan: true, avatar: true, createdAt: true }
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

router.patch('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: req.userId } }
      })
      if (existing) return res.status(409).json({ error: 'Email already in use' })
    }
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { ...(name && { name }), ...(email && { email }) },
      select: { id: true, name: true, email: true, plan: true, avatar: true, createdAt: true }
    })
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

router.patch('/password', async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords are required' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' })
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } })
    res.json({ message: 'Password updated successfully' })
  } catch {
    res.status(500).json({ error: 'Failed to update password' })
  }
})

router.delete('/account', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.userId } })
    res.json({ message: 'Account deleted successfully' })
  } catch {
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

export default router
