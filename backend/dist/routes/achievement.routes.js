"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const achievement_controller_1 = require("../controllers/achievement.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const achievement_schema_1 = require("../schemas/achievement.schema");
const client_1 = require("@prisma/client");
const zod_1 = require("../utils/zod");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate); // All achievement routes require authentication
// Admin-only routes for managing achievements
router.post('/', (0, role_middleware_1.authorize)([client_1.Role.ADMIN]), (0, validation_middleware_1.validate)(achievement_schema_1.createAchievementSchema), achievement_controller_1.createAchievement);
router.patch('/:id', (0, role_middleware_1.authorize)([client_1.Role.ADMIN]), (0, validation_middleware_1.validate)(achievement_schema_1.updateAchievementSchema), achievement_controller_1.updateAchievement);
router.delete('/:id', (0, role_middleware_1.authorize)([client_1.Role.ADMIN]), (0, validation_middleware_1.validate)(achievement_schema_1.getAchievementByIdSchema), achievement_controller_1.deleteAchievement);
// Publicly accessible (authenticated) routes for viewing achievements
router.get('/', achievement_controller_1.getAchievements); // Get all available achievements
router.get('/me', (0, validation_middleware_1.validate)(zod_1.paginationSchema.partial()), achievement_controller_1.getMyAchievements); // Get achievements for the authenticated user
router.get('/user/:userId', (0, validation_middleware_1.validate)(achievement_schema_1.getUserAchievementsSchema), achievement_controller_1.getUserAchievementsById); // Get achievements for a specific user (e.g., for profile pages)
router.get('/:id', (0, validation_middleware_1.validate)(achievement_schema_1.getAchievementByIdSchema), achievement_controller_1.getAchievement); // Get details of a specific achievement
exports.default = router;
