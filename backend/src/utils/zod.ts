import { z } from 'zod';

// Custom error messages for common validations
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long');
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Helper for optional UUIDs
export const optionalUuidSchema = z.string().uuid('Invalid UUID format').optional().nullable();

// Helper for pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
});
