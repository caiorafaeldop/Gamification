import { z } from 'zod';
import { uuidSchema, paginationSchema } from '../utils/zod';

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Project title must be at least 3 characters long'),
    description: z.string().optional(),
    category: z.string().optional(),
    type: z.string().optional(),
    leaderId: uuidSchema,
    memberIds: z.array(uuidSchema).optional(),
    color: z.string().optional(),
    status: z.string().optional(),
    xpReward: z.number().int().positive().optional(),
    progress: z.number().int().min(0).max(100).optional(),
    coverUrl: z.string().optional(),
  }),
});

export const getProjectByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    title: z.string().min(3, 'Project title must be at least 3 characters long').optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    type: z.string().optional(),
    leaderId: uuidSchema.optional(),
    color: z.string().optional(),
    status: z.string().optional(),
    xpReward: z.number().int().positive().optional(),
    progress: z.number().int().min(0).max(100).optional(),
    coverUrl: z.string().optional(),
    pointsPerOpenTask: z.number().int().min(0).optional(),
    pointsPerCompletedTask: z.number().int().min(0).optional(),
  }).partial(),
});

export const addProjectMemberSchema = z.object({
  params: z.object({
    id: uuidSchema, // projectId
  }),
  body: z.object({
    userId: uuidSchema,
  }),
});

export const removeProjectMemberSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
    userId: uuidSchema,
  }),
});

export const getProjectsSchema = z.object({
  query: paginationSchema.partial(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>['body'];
