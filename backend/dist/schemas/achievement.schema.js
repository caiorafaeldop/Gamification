"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAchievementsSchema = exports.updateAchievementSchema = exports.getAchievementByIdSchema = exports.createAchievementSchema = void 0;
const zod_1 = require("zod");
const zod_2 = require("../utils/zod");
exports.createAchievementSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Achievement name must be at least 3 characters long'),
        description: zod_1.z.string().min(10, 'Achievement description must be at least 10 characters long'),
        icon: zod_1.z.string().optional(),
        criteria: zod_1.z.string().min(5, 'Achievement criteria is required'),
    }),
});
exports.getAchievementByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema,
    }),
});
exports.updateAchievementSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema,
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Achievement name must be at least 3 characters long').optional(),
        description: zod_1.z.string().min(10, 'Achievement description must be at least 10 characters long').optional(),
        icon: zod_1.z.string().optional(),
        criteria: zod_1.z.string().min(5, 'Achievement criteria is required').optional(),
    }).partial(),
});
exports.getUserAchievementsSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_2.uuidSchema,
    }),
    query: zod_2.paginationSchema.partial(),
});
