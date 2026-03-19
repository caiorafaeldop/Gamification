import { Router } from 'express';
import { getProjectKanban, moveTask, createColumn, updateColumn, deleteColumn, reorderColumns, toggleTaskCompletion } from '../controllers/kanban.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';

const router = Router();

router.use(unifiedAuth);

// Get Kanban board for a project
router.get('/projects/:projectId', getProjectKanban);

// Move a task (column change only — for organization)
router.patch('/tasks/:taskId/move', moveTask);

// Toggle task completion (awards/removes points)
router.patch('/tasks/:taskId/toggle-completion', toggleTaskCompletion);

// Column management
router.post('/columns', createColumn);
router.post('/columns/reorder', reorderColumns);
router.put('/columns/:columnId', updateColumn);
router.delete('/columns/:columnId', deleteColumn);

export default router;
