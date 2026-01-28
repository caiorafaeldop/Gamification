import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string; // Alterado de 'id' para 'userId' para consistência
        role: Role;
      };
    }
  }
}

export {};
