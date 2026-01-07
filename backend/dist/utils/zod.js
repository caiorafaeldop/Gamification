"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.optionalUuidSchema = exports.uuidSchema = exports.passwordSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
// Custom error messages for common validations
exports.emailSchema = zod_1.z.string().email('Invalid email address');
exports.passwordSchema = zod_1.z.string().min(8, 'Password must be at least 8 characters long');
exports.uuidSchema = zod_1.z.string().uuid('Invalid UUID format');
// Helper for optional UUIDs
exports.optionalUuidSchema = zod_1.z.string().uuid('Invalid UUID format').optional().nullable();
// Helper for pagination
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10).optional(),
});
