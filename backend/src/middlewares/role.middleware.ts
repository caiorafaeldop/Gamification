import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

// Removida a interface AuthenticatedRequest e agora confiamos na declaração global em express.d.ts
// Isso garante que req.user.userId seja usado consistentemente.

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(403).json({ message: 'Access denied. User not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};