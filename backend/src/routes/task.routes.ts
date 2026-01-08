import { Router } from 'express';
import { createTask, getTask, updateTask, moveTask, deleteTask, getProjectKanban, getMyTasks } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createTaskSchema, getTaskByIdSchema, updateTaskSchema, moveTaskSchema, getProjectKanbanSchema } from '../schemas/task.schema';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate); // All task routes require authentication

router.post('/', authorize([Role.ADMIN, Role.LEADER]), validate(createTaskSchema), createTask);
router.get('/my-tasks', getMyTasks);
router.get('/:id', validate(getTaskByIdSchema), getTask);
router.patch('/:id', validate(updateTaskSchema), updateTask); // Assigned user, team leader, or admin
router.post('/:id/move', validate(moveTaskSchema), moveTask); // Assigned user, team leader, or admin
router.delete('/:id', authorize([Role.ADMIN, Role.LEADER]), validate(getTaskByIdSchema), deleteTask); // Team leader or admin

// Changed from /team/:teamId/kanban to /project/:projectId/kanban
router.get('/project/:projectId/kanban', validate(getProjectKanbanSchema), getProjectKanban);

export default router;