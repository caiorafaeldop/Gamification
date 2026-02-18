import { Router } from 'express';
import { createTask, getTask, updateTask, moveTask, deleteTask, getMyTasks } from '../controllers/task.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createTaskSchema, getTaskByIdSchema, updateTaskSchema, moveTaskSchema } from '../schemas/task.schema';
import { Role } from '@prisma/client';

const router = Router();

router.use(unifiedAuth); // All task routes require authentication

router.post('/', authorize([Role.ADMIN, Role.LEADER, Role.MEMBER]), validate(createTaskSchema), createTask);
router.get('/my-tasks', getMyTasks);
router.get('/:id', validate(getTaskByIdSchema), getTask);
router.patch('/:id', validate(updateTaskSchema), updateTask); // Assigned user, team leader, or admin
router.post('/:id/move', validate(moveTaskSchema), moveTask); // Assigned user, team leader, or admin
router.delete('/:id', authorize([Role.ADMIN, Role.LEADER, Role.MEMBER]), validate(getTaskByIdSchema), deleteTask); // Team leader or admin

export default router;
