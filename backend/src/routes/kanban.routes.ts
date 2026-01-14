import { Router } from 'express';
import { getProjectKanban, moveTask, createColumn, updateColumn, deleteColumnController, reorderColumns } from '../controllers/kanban.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Get Kanban board for a project (Includes columns and tasks)
router.get('/projects/:projectId', getProjectKanban);

// Column management
router.post('/projects/:projectId/columns', createColumn);
router.patch('/columns/:columnId', updateColumn);
router.delete('/columns/:columnId', deleteColumnController);
router.patch('/projects/:projectId/columns/reorder', reorderColumns);

// Move a task between columns
router.patch('/tasks/:taskId/move', moveTask);

export default router;
