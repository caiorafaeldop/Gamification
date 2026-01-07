"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("../controllers/task.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const task_schema_1 = require("../schemas/task.schema");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate); // All task routes require authentication
router.post('/', (0, role_middleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.LEADER]), (0, validation_middleware_1.validate)(task_schema_1.createTaskSchema), task_controller_1.createTask);
router.get('/:id', (0, validation_middleware_1.validate)(task_schema_1.getTaskByIdSchema), task_controller_1.getTask);
router.patch('/:id', (0, validation_middleware_1.validate)(task_schema_1.updateTaskSchema), task_controller_1.updateTask); // Assigned user, team leader, or admin
router.post('/:id/move', (0, validation_middleware_1.validate)(task_schema_1.moveTaskSchema), task_controller_1.moveTask); // Assigned user, team leader, or admin
router.delete('/:id', (0, role_middleware_1.authorize)([client_1.Role.ADMIN, client_1.Role.LEADER]), (0, validation_middleware_1.validate)(task_schema_1.getTaskByIdSchema), task_controller_1.deleteTask); // Team leader or admin
router.get('/team/:teamId/kanban', (0, validation_middleware_1.validate)(task_schema_1.getTeamKanbanSchema), task_controller_1.getTeamKanban); // Any authenticated user who is a member of the team
exports.default = router;
