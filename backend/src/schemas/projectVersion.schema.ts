import { z } from 'zod';
import { uuidSchema } from '../utils/zod';

export const projectVersionStatusSchema = z.enum([
  'PLANNED',
  'IN_PROGRESS',
  'LOCKED',
  'RELEASED',
  'ARCHIVED',
]);

const nullableDateSchema = z.string().datetime().nullable().optional();

export const listProjectVersionsSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const createProjectVersionSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z.string().min(1, 'Version name is required').max(120),
    description: z.string().max(2000).optional().nullable(),
    status: projectVersionStatusSchema.optional(),
    startDate: nullableDateSchema,
    dueDate: nullableDateSchema,
    releasedAt: nullableDateSchema,
  }),
});

export const updateProjectVersionSchema = z.object({
  params: z.object({
    id: uuidSchema,
    versionId: uuidSchema,
  }),
  body: z.object({
    name: z.string().min(1, 'Version name is required').max(120).optional(),
    description: z.string().max(2000).optional().nullable(),
    status: projectVersionStatusSchema.optional(),
    startDate: nullableDateSchema,
    dueDate: nullableDateSchema,
    releasedAt: nullableDateSchema,
  }).partial(),
});

export const deleteProjectVersionSchema = z.object({
  params: z.object({
    id: uuidSchema,
    versionId: uuidSchema,
  }),
});

export type ProjectVersionStatusInput = z.infer<typeof projectVersionStatusSchema>;
export type CreateProjectVersionInput = z.infer<typeof createProjectVersionSchema>['body'];
export type UpdateProjectVersionInput = z.infer<typeof updateProjectVersionSchema>['body'];
