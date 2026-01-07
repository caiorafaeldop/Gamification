"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_controller_1 = require("../controllers/team.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const team_schema_1 = require("../schemas/team.schema");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate); // All team routes require authentication
router.post('/', (0, role_middleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.LEADER]), (0, validation_middleware_1.validate)(team_schema_1.createTeamSchema), team_controller_1.createTeam);
router.get('/', (0, validation_middleware_1.validate)(team_schema_1.getTeamsSchema), team_controller_1.getTeams);
router.get('/:id', (0, validation_middleware_1.validate)(team_schema_1.getTeamByIdSchema), team_controller_1.getTeam);
router.patch('/:id', (0, role_middleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.LEADER]), (0, validation_middleware_1.validate)(team_schema_1.updateTeamSchema), team_controller_1.updateTeam); // Leader of team or Admin
router.delete('/:id', (0, role_middleware_1.authorize)([client_1.Role.ADMIN]), (0, validation_middleware_1.validate)(team_schema_1.getTeamByIdSchema), team_controller_1.deleteTeam); // Admin only
router.post('/:id/members', (0, role_middleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.LEADER]), (0, validation_middleware_1.validate)(team_schema_1.addTeamMemberSchema), team_controller_1.addMember); // Leader of team or Admin
router.delete('/:teamId/members/:userId', (0, role_middleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.LEADER]), (0, validation_middleware_1.validate)(team_schema_1.removeTeamMemberSchema), team_controller_1.removeMember); // Leader of team or Admin
exports.default = router;
