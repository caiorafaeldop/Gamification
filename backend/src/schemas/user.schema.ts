import { z } from 'zod';
import { uuidSchema, paginationSchema } from '../utils/zod';
import { Role } from '@prisma/client';

export const getUserByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
    role: z.nativeEnum(Role).optional(),
    isActive: z.boolean().optional(),
    course: z.string().optional(),
    avatarColor: z.string().optional(),
    bio: z.string().optional(),
    avatarUrl: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
    skills: z.array(z.string()).optional(),
    contactEmail: z.string().or(z.literal('')).optional(),
    linkedinUrl: z.string().or(z.literal('')).optional(),
    githubUrl: z.string().or(z.literal('')).optional(),
  }).partial(),
});

export const updateUserPointsSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    points: z.number().int('Points must be an integer'),
    reason: z.string().min(5, 'Reason for point adjustment is required'),
  }),
});

export const getUserActivitySchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  query: paginationSchema.partial(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type UpdateUserPointsInput = z.infer<typeof updateUserPointsSchema>['body'];