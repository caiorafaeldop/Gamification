import { Request, Response, NextFunction } from 'express';
// import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { verifyToken } from '../utils/jwt';
import prisma from '../utils/prisma';

// Initialize Clerk Middleware (loose mode to not block immediately)
// const clerkMiddleware = ClerkExpressWithAuth();

// Extend Express Request to include user and auth
declare global {
  namespace Express {
    interface Request {
      user?: any;
      auth?: {
        userId: string;
        sessionId: string;
        getToken: () => Promise<string>;
      };
    }
  }
}

export const unifiedAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Clerk Authentication - Comentado
    // clerkMiddleware(req, res, async () => {
    //   if (req.auth?.userId) {
    //     const clerk = (await import('@clerk/clerk-sdk-node')).createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    //     const clerkUser = await clerk.users.getUser(req.auth.userId);
    //     const email = clerkUser.emailAddresses[0]?.emailAddress;
    //     if (email) {
    //       let localUser = await prisma.user.findUnique({ where: { email } });
    //       if (!localUser) {
    //         const defaultTier = await prisma.tier.findFirst({ orderBy: { order: 'asc' } });
    //         if (defaultTier) {
    //           localUser = await prisma.user.create({
    //             data: {
    //               name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email.split('@')[0],
    //               email,
    //               passwordHash: 'clerk-managed',
    //               tierId: defaultTier.id,
    //               role: 'MEMBER',
    //               avatarUrl: clerkUser.imageUrl || null,
    //             }
    //           });
    //         }
    //       }
    //       if (localUser) {
    //         req.user = { ...localUser, userId: localUser.id, role: localUser.role };
    //         return next();
    //       }
    //     }
    //   }
    // });

    // 2. Legacy JWT Authentication
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      try {
        const decoded = verifyToken(token);
        if (decoded) {
          const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
          if (user && user.isActive) {
            req.user = { ...user, userId: user.id, role: user.role };
            return next();
          }
        }
      } catch (jwtError) {
        // Token invalid or expired
      }
    }

    // 3. If neither worked
    return res.status(401).json({ message: 'Unauthorized: Invalid credentials' });

  } catch (error) {
    console.error('[UnifiedAuth] Error:', error);
    return res.status(500).json({ message: 'Internal Server Error during authentication' });
  }
};
