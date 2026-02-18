import { Router } from 'express';
import { createTier, getTier, getTiers, updateTier, deleteTier } from '../controllers/tier.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { uuidSchema } from '../utils/zod';
import { Role } from '@prisma/client';
import { z } from 'zod';

const router = Router();

router.use(unifiedAuth); // All tier routes require authentication

// Admin-only routes for creating, updating, deleting tiers
router.post('/', authorize([Role.ADMIN]), validate(z.object({ body: z.object({ name: z.string(), minPoints: z.number().int(), order: z.number().int(), icon: z.string().optional() }) })), createTier);
router.patch('/:id', authorize([Role.ADMIN]), validate(z.object({ params: z.object({ id: uuidSchema }), body: z.object({ name: z.string().optional(), minPoints: z.number().int().optional(), order: z.number().int().optional(), icon: z.string().optional() }).partial() })), updateTier);
router.delete('/:id', authorize([Role.ADMIN]), validate(z.object({ params: z.object({ id: uuidSchema }) })), deleteTier);

// Publicly accessible (authenticated) routes for viewing tiers
router.get('/', getTiers);
router.get('/:id', validate(z.object({ params: z.object({ id: uuidSchema }) })), getTier);

export default router;
