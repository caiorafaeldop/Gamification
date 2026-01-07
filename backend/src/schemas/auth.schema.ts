import { z } from 'zod';
import { emailSchema, passwordSchema } from '../utils/zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    email: emailSchema,
    password: passwordSchema,
    role: z.nativeEnum(Role).optional().default(Role.MEMBER), // Default to MEMBER, ADMIN/LEADER set by admin
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];