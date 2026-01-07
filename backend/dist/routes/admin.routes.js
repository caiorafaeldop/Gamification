"use strict";
// This file is intentionally left minimal as admin functionalities are integrated
// into user, team, and tier controllers with role-based authorization.
// This route file can be expanded if there are purely admin-dashboard specific APIs.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.authorize)([client_1.Role.ADMIN]));
// Example: A route for global analytics, if it were a separate endpoint
// router.get('/analytics', getGlobalAnalytics);
exports.default = router;
