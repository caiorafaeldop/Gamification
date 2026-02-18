import { Router } from 'express';
import { getProjectKanban, moveTask, createColumn, updateColumn, deleteColumn, reorderColumns } from '../controllers/kanban.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';

const router = Router();

router.use(unifiedAuth);

// Get Kanban board for a project
router.get('/projects/:projectId', getProjectKanban);

// Move a task
router.patch('/tasks/:taskId/move', moveTask);

// Column management
router.post('/columns', createColumn);
router.post('/columns/reorder', reorderColumns);
router.put('/columns/:columnId', updateColumn);
router.delete('/columns/:columnId', deleteColumn);

export default router;
