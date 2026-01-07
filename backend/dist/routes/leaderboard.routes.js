"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaderboard_controller_1 = require("../controllers/leaderboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const zod_1 = require("../utils/zod");
const zod_2 = require("zod"); // Importar z para usar z.object
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate); // All leaderboard routes require authentication
router.get('/global', (0, validation_middleware_1.validate)(zod_1.paginationSchema.partial()), leaderboard_controller_1.getGlobalLeaderboard);
// Corrigido: uuidSchema é um ZodString, não tem .shape. Deve ser envolvido em z.object.
router.get('/team/:teamId', (0, validation_middleware_1.validate)(zod_1.paginationSchema.partial().extend({ params: zod_2.z.object({ teamId: zod_1.uuidSchema }) })), leaderboard_controller_1.getTeamLeaderboard);
router.get('/weekly', (0, validation_middleware_1.validate)(zod_1.paginationSchema.partial()), leaderboard_controller_1.getWeeklyLeaderboard);
exports.default = router;
