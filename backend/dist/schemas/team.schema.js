"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamsSchema = exports.removeTeamMemberSchema = exports.addTeamMemberSchema = exports.updateTeamSchema = exports.getTeamByIdSchema = exports.createTeamSchema = void 0;
const zod_1 = require("zod");
const zod_2 = require("../utils/zod");
exports.createTeamSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Team name must be at least 3 characters long'),
        description: zod_1.z.string().optional(),
        focusArea: zod_1.z.string().optional(),
        leaderId: zod_2.uuidSchema,
    }),
});
exports.getTeamByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema,
    }),
});
exports.updateTeamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema,
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Team name must be at least 3 characters long').optional(),
        description: zod_1.z.string().optional(),
        focusArea: zod_1.z.string().optional(),
        leaderId: zod_2.uuidSchema.optional(),
    }).partial(),
});
exports.addTeamMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_2.uuidSchema, // teamId
    }),
    body: zod_1.z.object({
        userId: zod_2.uuidSchema,
    }),
});
exports.removeTeamMemberSchema = zod_1.z.object({
    params: zod_1.z.object({
        teamId: zod_2.uuidSchema,
        userId: zod_2.uuidSchema,
    }),
});
exports.getTeamsSchema = zod_1.z.object({
    query: zod_2.paginationSchema.partial(),
});
