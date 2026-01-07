import { z } from 'zod';
import { uuidSchema, paginationSchema } from '../utils/zod';

export const createAchievementSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Achievement name must be at least 3 characters long'),
    description: z.string().min(10, 'Achievement description must be at least 10 characters long'),
    icon: z.string().optional(),
    criteria: z.string().min(5, 'Achievement criteria is required'),
  }),
});

export const getAchievementByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const updateAchievementSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z.string().min(3, 'Achievement name must be at least 3 characters long').optional(),
    description: z.string().min(10, 'Achievement description must be at least 10 characters long').optional(),
    icon: z.string().optional(),
    criteria: z.string().min(5, 'Achievement criteria is required').optional(),
  }).partial(),
});

export const getUserAchievementsSchema = z.object({
  params: z.object({
    userId: uuidSchema,
  }),
  query: paginationSchema.partial(),
});

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>['body'];
export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>['body'];