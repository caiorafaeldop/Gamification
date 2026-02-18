import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { NextFunction, Request, Response } from 'express';
import prisma from '../utils/prisma';

// Validate Secret Key Presence
if (!process.env.CLERK_SECRET_KEY) {
  console.error('[clerkAuth] CRITICAL: CLERK_SECRET_KEY is missing from environment variables!');
} else if (process.env.CLERK_SECRET_KEY.length < 32) {
  console.error('[clerkAuth] CRITICAL: CLERK_SECRET_KEY seems too short/invalid!', process.env.CLERK_SECRET_KEY);
}

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

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

export const clerkAuth = [
  ClerkExpressWithAuth(),
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log('[clerkAuth] Middleware triggered');
    
    // If no userId, Clerk authentication failed or no token provided
    if (!req.auth?.userId) {
      // console.error('[clerkAuth] No userId in req.auth');
      return res.status(401).json({ message: 'Unauthorized: No valid session detected' });
    }

    try {
      // console.log(`[clerkAuth] Authenticating Clerk user: ${req.auth.userId}`);

      // 1. Fetch user details from Clerk
      let clerkUser;
      try {
        clerkUser = await clerk.users.getUser(req.auth.userId);
      } catch (clerkError: any) {
        console.error('[clerkAuth] Failed to fetch user from Clerk:', clerkError);
        return res.status(500).json({ message: 'Authentication Service Error: Could not verify user identity', details: clerkError.message });
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress;
      // console.log(`[clerkAuth] Clerk user email: ${email}`);

      if (!email) {
        return res.status(400).json({ message: 'User must have an email address' });
      }

      // 2. Find or auto-create the user in the local database
      let localUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!localUser) {
        console.log(`[clerkAuth] User not found locally, auto-provisioning: ${email}`);

        // Get the lowest tier (default tier for new users)
        const defaultTier = await prisma.tier.findFirst({
          orderBy: { order: 'asc' },
        });

        if (!defaultTier) {
          console.error('[clerkAuth] No tiers found in database. Please seed tiers first.');
          return res.status(500).json({ message: 'System configuration error: no tiers available' });
        }

        const displayName =
          `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
          email.split('@')[0];

        localUser = await prisma.user.create({
          data: {
            name: displayName,
            email,
            passwordHash: 'clerk-managed',
            tierId: defaultTier.id,
            role: 'MEMBER',
            avatarUrl: clerkUser.imageUrl || null,
          },
        });

        console.log(`[clerkAuth] Auto-provisioned user: ${email} (${localUser.id})`);
      }

      // 3. Attach local user to request
      req.user = {
        ...localUser,
        userId: localUser.id,
        role: localUser.role,
      };
      next();
    } catch (error: any) {
      console.error('[clerkAuth] GENERAL ERROR:', error?.message || error);
      console.error('[clerkAuth] Stack:', error?.stack);
      return res.status(500).json({ 
        message: 'Internal Server Error during authentication', 
        error: error.message,
        details: 'Check backend terminal for full stack trace'
      });
    }
  }
];
