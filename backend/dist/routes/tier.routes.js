"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tier_controller_1 = require("../controllers/tier.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const zod_1 = require("../utils/zod");
const client_1 = require("@prisma/client");
const zod_2 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate); // All tier routes require authentication
// Admin-only routes for creating, updating, deleting tiers
router.post('/', (0, role_middleware_1.authorize)([client_1.Role.ADMIN]), (0, validation_middleware_1.validate)(zod_2.z.object({ body: zod_2.z.object({ name: zod_2.z.string(), minPoints: zod_2.z.number().int(), order: zod_2.z.number().int(), icon: zod_2.z.string().optional() }) })), tier_controller_1.createTier);
router.patch('/:id', (0, role_middleware_1.authorize)([client_1.Role.ADMIN]), (0, validation_middleware_1.validate)(zod_2.z.object({ params: zod_2.z.object({ id: zod_1.uuidSchema }), body: zod_2.z.object({ name: zod_2.z.string().optional(), minPoints: zod_2.z.number().int().optional(), order: zod_2.z.number().int().optional(), icon: zod_2.z.string().optional() }).partial() })), tier_controller_1.updateTier);
router.delete('/:id', (0, role_middleware_1.authorize)([client_1.Role.ADMIN]), (0, validation_middleware_1.validate)(zod_2.z.object({ params: zod_2.z.object({ id: zod_1.uuidSchema }) })), tier_controller_1.deleteTier);
// Publicly accessible (authenticated) routes for viewing tiers
router.get('/', tier_controller_1.getTiers);
router.get('/:id', (0, validation_middleware_1.validate)(zod_2.z.object({ params: zod_2.z.object({ id: zod_1.uuidSchema }) })), tier_controller_1.getTier);
exports.default = router;
