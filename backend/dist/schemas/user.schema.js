"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserActivitySchema = exports.updateUserPointsSchema = exports.updateUserSchema = exports.getUserByIdSchema = void 0;
const zod_1 = require("zod");
const zod_2 = require("../utils/zod");
const client_1 = require("@prisma/client");
exports.getUserByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema,
    }),
});
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema,
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Name must be at least 3 characters long').optional(),
        email: zod_1.z.string().email('Invalid email address').optional(),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters long').optional(),
        role: zod_1.z.nativeEnum(client_1.Role).optional(),
        isActive: zod_1.z.boolean().optional(),
    }).partial(),
});
exports.updateUserPointsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema,
    }),
    body: zod_1.z.object({
        points: zod_1.z.number().int('Points must be an integer'),
        reason: zod_1.z.string().min(5, 'Reason for point adjustment is required'),
    }),
});
exports.getUserActivitySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema,
    }),
    query: zod_2.paginationSchema.partial(),
});
