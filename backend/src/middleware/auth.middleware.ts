import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

type AuthenticatedRequest = Request & {
  user?: {
    id: number
    email?: string
    correo?: string
  }
}

const requireAuthHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header('authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const secret = process.env.JWT_SECRET

      if (!secret) {
        return res.status(500).json({ message: 'JWT_SECRET no configurado' })
      }

      const decoded = jwt.verify(token, secret) as {
        id?: number
        email?: string
        correo?: string
      }

      if (!decoded?.id) {
        return res.status(401).json({ message: 'Token inválido' })
      }

      req.user = {
        id: Number(decoded.id),
        email: decoded.email,
        correo: decoded.correo
      }

      return next()
    }

    const rawUserId = req.header('x-user-id')
    const userIdFromHeader = rawUserId ? Number(rawUserId) : NaN

    console.log('DEBUG x-user-id:', rawUserId)

    if (Number.isInteger(userIdFromHeader) && userIdFromHeader > 0) {
      req.user = {
        id: userIdFromHeader
      }

      return next()
    }

    return res.status(401).json({ message: 'Token no proporcionado' })
  } catch (error) {
    console.error('AUTH ERROR:', error)
    return res.status(401).json({ message: 'Token inválido' })
  }
}

export const requireAuth = requireAuthHandler
export const verifyAuth = requireAuthHandler