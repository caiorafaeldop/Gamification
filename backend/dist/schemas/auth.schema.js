"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const zod_2 = require("../utils/zod");
const client_1 = require("@prisma/client");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Name must be at least 3 characters long'),
        email: zod_2.emailSchema,
        password: zod_2.passwordSchema,
        role: zod_1.z.nativeEnum(client_1.Role).optional().default(client_1.Role.MEMBER), // Default to MEMBER, ADMIN/LEADER set by admin
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_2.emailSchema,
        password: zod_2.passwordSchema,
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string(),
    }),
});
