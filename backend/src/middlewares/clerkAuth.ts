// import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
// import { createClerkClient } from '@clerk/clerk-sdk-node';
import { NextFunction, Request, Response } from 'express';
import prisma from '../utils/prisma';

// Validate Secret Key Presence
// if (!process.env.CLERK_SECRET_KEY) {
//   console.error('[clerkAuth] CRITICAL: CLERK_SECRET_KEY is missing from environment variables!');
// } else if (process.env.CLERK_SECRET_KEY.length < 32) {
//   console.error('[clerkAuth] CRITICAL: CLERK_SECRET_KEY seems too short/invalid!', process.env.CLERK_SECRET_KEY);
// }

// const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

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

// Clerk Auth Middleware - Comentado (todo o middleware depende do Clerk SDK)
// export const clerkAuth = [
//   ClerkExpressWithAuth(),
//   async (req: Request, res: Response, next: NextFunction) => {
//     if (!req.auth?.userId) {
//       return res.status(401).json({ message: 'Unauthorized: No valid session detected' });
//     }
//     try {
//       let clerkUser;
//       try {
//         clerkUser = await clerk.users.getUser(req.auth.userId);
//       } catch (clerkError: any) {
//         console.error('[clerkAuth] Failed to fetch user from Clerk:', clerkError);
//         return res.status(500).json({ message: 'Authentication Service Error', details: clerkError.message });
//       }
//       const email = clerkUser.emailAddresses[0]?.emailAddress;
//       if (!email) {
//         return res.status(400).json({ message: 'User must have an email address' });
//       }
//       let localUser = await prisma.user.findUnique({ where: { email } });
//       if (!localUser) {
//         const defaultTier = await prisma.tier.findFirst({ orderBy: { order: 'asc' } });
//         if (!defaultTier) {
//           return res.status(500).json({ message: 'System configuration error: no tiers available' });
//         }
//         const displayName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email.split('@')[0];
//         localUser = await prisma.user.create({
//           data: {
//             name: displayName,
//             email,
//             passwordHash: 'clerk-managed',
//             tierId: defaultTier.id,
//             role: 'MEMBER',
//             avatarUrl: clerkUser.imageUrl || null,
//           },
//         });
//       }
//       req.user = { ...localUser, userId: localUser.id, role: localUser.role };
//       next();
//     } catch (error: any) {
//       console.error('[clerkAuth] GENERAL ERROR:', error?.message || error);
//       return res.status(500).json({ message: 'Internal Server Error during authentication', error: error.message });
//     }
//   }
// ];

// Exportando placeholder vazio para não quebrar imports existentes
export const clerkAuth = [] as any[];
