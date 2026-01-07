import { Router } from 'express';
import { getProjectKanban, moveTask } from '../controllers/kanban.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Get Kanban board for a project
router.get('/projects/:projectId', getProjectKanban);

// Move a task
router.patch('/tasks/:taskId/move', moveTask);

export default router;
