import { z } from 'zod';
import { uuidSchema, optionalUuidSchema } from '../utils/zod';
import { TaskStatus } from '@prisma/client';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Task title must be at least 3 characters long'),
    description: z.string().optional(),
    difficulty: z.number().int('Difficulty must be an integer').min(1, 'Difficulty must be between 1 and 10').max(10, 'Difficulty must be between 1 and 10'),
    estimatedTimeMinutes: z.coerce.number().int('Estimated time must be an integer').min(1, 'Estimated time must be at least 1 minute').optional().nullable(),
    projectId: uuidSchema,
    columnId: optionalUuidSchema,
    assignedToId: optionalUuidSchema,
    dueDate: z.string().datetime().optional().nullable(),
    tags: z.array(z.string()).optional(),
    requiredTierId: optionalUuidSchema,
    isExternalDemand: z.boolean().optional(),
  }),
});

export const getTaskByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    title: z.string().min(3, 'Task title must be at least 3 characters long').optional(),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    difficulty: z.number().int('Difficulty must be an integer').min(1, 'Difficulty must be between 1 and 10').max(10, 'Difficulty must be between 1 and 10').optional(),
    estimatedTimeMinutes: z.coerce.number().int('Estimated time must be an integer').min(1, 'Estimated time must be at least 1 minute').optional().nullable(),
    assignedToId: optionalUuidSchema,
    dueDate: z.string().datetime().optional().nullable(),
    tags: z.array(z.string()).optional(),
    requiredTierId: optionalUuidSchema,
    isExternalDemand: z.boolean().optional(),
  }).partial(),
});

export const moveTaskSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    newStatus: z.nativeEnum(TaskStatus),
  }),
});

export const getProjectKanbanSchema = z.object({
  params: z.object({
    projectId: uuidSchema,
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body'];
export type MoveTaskInput = z.infer<typeof moveTaskSchema>['body'];