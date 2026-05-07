import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import prisma from '../utils/prisma';

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyToken(token);
        if (decoded) {
          const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
          if (user && user.isActive) {
            req.user = { ...user, userId: user.id, role: user.role };
          }
        }
      } catch {
        // Token inválido/expirado: segue como guest.
      }
    }
    return next();
  } catch (error) {
    console.error('[optionalAuth] Error:', error);
    return next();
  }
};
