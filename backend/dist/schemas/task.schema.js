"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamKanbanSchema = exports.moveTaskSchema = exports.updateTaskSchema = exports.getTaskByIdSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const zod_2 = require("../utils/zod");
const client_1 = require("@prisma/client");
exports.createTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Task title must be at least 3 characters long'),
        description: zod_1.z.string().optional(),
        difficulty: zod_1.z.nativeEnum(client_1.TaskDifficulty),
        teamId: zod_2.uuidSchema,
        assignedToId: zod_2.optionalUuidSchema,
        dueDate: zod_1.z.string().datetime().optional().nullable(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        requiredTierId: zod_2.optionalUuidSchema,
        isExternalDemand: zod_1.z.boolean().optional(), // Adicionado
    }),
});
exports.getTaskByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema,
    }),
});
exports.updateTaskSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema,
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Task title must be at least 3 characters long').optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
        difficulty: zod_1.z.nativeEnum(client_1.TaskDifficulty).optional(),
        assignedToId: zod_2.optionalUuidSchema,
        dueDate: zod_1.z.string().datetime().optional().nullable(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        requiredTierId: zod_2.optionalUuidSchema,
        isExternalDemand: zod_1.z.boolean().optional(), // Adicionado
    }).partial(),
});
exports.moveTaskSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema,
    }),
    body: zod_1.z.object({
        newStatus: zod_1.z.nativeEnum(client_1.TaskStatus),
    }),
});
exports.getTeamKanbanSchema = zod_1.z.object({
    params: zod_1.z.object({
        teamId: zod_2.uuidSchema,
    }),
});
