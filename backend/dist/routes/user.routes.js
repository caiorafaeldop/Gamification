"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const user_schema_1 = require("../schemas/user.schema");
const client_1 = require("@prisma/client");
const zod_1 = require("../utils/zod");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate); // All user routes require authentication
router.get('/me', user_controller_1.getMyProfile);
router.get('/', (0, role_middleware_1.authorize)([client_1.Role.ADMIN]), (0, validation_middleware_1.validate)(zod_1.paginationSchema.partial()), user_controller_1.getAllUsers); // Admin only to get all users
router.get('/:id', (0, validation_middleware_1.validate)(user_schema_1.getUserByIdSchema), user_controller_1.getUserProfile);
router.patch('/:id', (0, validation_middleware_1.validate)(user_schema_1.updateUserSchema), user_controller_1.updateUserDetails); // User can update their own profile, admin can update any
router.patch('/:id/points', (0, role_middleware_1.authorize)([client_1.Role.ADMIN]), (0, validation_middleware_1.validate)(user_schema_1.updateUserPointsSchema), user_controller_1.adjustUserPoints); // Admin only
router.get('/:id/activity', (0, validation_middleware_1.validate)(user_schema_1.getUserActivitySchema), user_controller_1.getUserActivity);
// Admin specific user management routes
router.patch('/:id/promote', (0, role_middleware_1.authorize)([client_1.Role.ADMIN]), (0, validation_middleware_1.validate)(user_schema_1.getUserByIdSchema), user_controller_1.promoteUserRole); // Admin can promote/demote
router.patch('/:id/toggle-active', (0, role_middleware_1.authorize)([client_1.Role.ADMIN]), (0, validation_middleware_1.validate)(user_schema_1.getUserByIdSchema), user_controller_1.toggleUserActiveStatus); // Admin can activate/deactivate
exports.default = router;
