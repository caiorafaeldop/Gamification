import { Router } from 'express';
import {
  createAchievement,
  getAchievement,
  getAchievements,
  updateAchievement,
  deleteAchievement,
  getMyAchievements,
  getUserAchievementsById,
} from '../controllers/achievement.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  createAchievementSchema,
  getAchievementByIdSchema,
  updateAchievementSchema,
  getUserAchievementsSchema,
} from '../schemas/achievement.schema';
import { Role } from '@prisma/client';
import { paginationSchema } from '../utils/zod';

const router = Router();

router.use(authenticate); // All achievement routes require authentication

// Admin-only routes for managing achievements
router.post('/', authorize([Role.ADMIN]), validate(createAchievementSchema), createAchievement);
router.patch('/:id', authorize([Role.ADMIN]), validate(updateAchievementSchema), updateAchievement);
router.delete('/:id', authorize([Role.ADMIN]), validate(getAchievementByIdSchema), deleteAchievement);

// Publicly accessible (authenticated) routes for viewing achievements
router.get('/', getAchievements); // Get all available achievements
router.get('/me', validate(paginationSchema.partial()), getMyAchievements); // Get achievements for the authenticated user
router.get('/user/:userId', validate(getUserAchievementsSchema), getUserAchievementsById); // Get achievements for a specific user (e.g., for profile pages)
router.get('/:id', validate(getAchievementByIdSchema), getAchievement); // Get details of a specific achievement

export default router;
