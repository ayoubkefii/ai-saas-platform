import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  user?: { id: string; email: string; name: string }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { userId: string; email: string; name: string }
    req.userId = decoded.userId
    req.user = { id: decoded.userId, email: decoded.email, name: decoded.name }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
