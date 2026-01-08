import { z } from 'zod';
import { emailSchema, passwordSchema } from '../utils/zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    email: z.string().min(1, 'Username or Email is required'),
    password: passwordSchema,
    role: z.nativeEnum(Role).optional().default(Role.MEMBER), // Default to MEMBER, ADMIN/LEADER set by admin
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Username or Email is required'),
    password: passwordSchema,
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Username or Email is required'),
    newPassword: passwordSchema,
    secretWord: z.string().min(1, 'Secret word is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];