import { Request, Response, NextFunction } from 'express';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { verifyToken } from '../utils/jwt';
import prisma from '../utils/prisma';
// Import logic from clerkAuth if needed, or implement similar logic here
// For simplicity and to avoid circular deps or complex refactors, we'll inline the Clerk user fetching logic or import if refactored.
// Actually, let's reuse the clerkAuth middleware's logic by wrapping it or re-implementing the user sync. 
// Standard Clerk middleware adds auth to req, but doesn't sync with Prisma. 
// We need to sync. Let's look at how clerkAuth.ts was doing it.

// To avoid code duplication, we should probably extract the sync logic. 
// But for now, let's implement the UnifiedAuth which tries Clerk first, then Legacy.

// Initialize Clerk Middleware (loose mode to not block immediately)
const clerkMiddleware = ClerkExpressWithAuth();

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
  // 1. Try Clerk Authentication
  clerkMiddleware(req, res, async () => {
    try {
      // Check if Clerk found a user
      if (req.auth?.userId) {
        // console.log(`[UnifiedAuth] Clerk User detected: ${req.auth.userId}`);
        
        // Sync Logic (Simplified version of clerkAuth.ts)
        const clerk = (await import('@clerk/clerk-sdk-node')).createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerkUser = await clerk.users.getUser(req.auth.userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        if (email) {
            let localUser = await prisma.user.findUnique({ where: { email } });
            
            if (!localUser) {
                // Auto-provisioning (Simplified)
                 const defaultTier = await prisma.tier.findFirst({ orderBy: { order: 'asc' } });
                 if (defaultTier) {
                    localUser = await prisma.user.create({
                        data: {
                            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email.split('@')[0],
                            email,
                            passwordHash: 'clerk-managed',
                            tierId: defaultTier.id,
                            role: 'MEMBER',
                            avatarUrl: clerkUser.imageUrl || null,
                        }
                    });
                 }
            }

            if (localUser) {
                req.user = { ...localUser, userId: localUser.id, role: localUser.role };
                return next();
            }
        }
      }

      // 2. Fallback to Legacy JWT Authentication
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        // console.log(`[UnifiedAuth] checking legacy token...`);

        try {
            const decoded = verifyToken(token);
            if (decoded) {
                const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
                if (user && user.isActive) {
                    req.user = { ...user, userId: user.id, role: user.role };
                    // console.log(`[UnifiedAuth] Legacy User authenticated: ${user.email}`);
                    return next();
                }
            }
        } catch (jwtError) {
            // Token invalid or expired, just ignore and fall through to 401
        }
      }

      // 3. If neither worked
      return res.status(401).json({ message: 'Unauthorized: Invalid credentials (Legacy or Clerk)' });

    } catch (error) {
      console.error('[UnifiedAuth] Error:', error);
      return res.status(500).json({ message: 'Internal Server Error during authentication' });
    }
  });
};
