import { Router } from 'express';
import { createProject, getProjectDetails, getProjects, joinProject } from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Public (authenticated) routes
router.get('/', getProjects);
router.get('/:id', getProjectDetails);
router.post('/', createProject);
router.post('/:id/join', joinProject);

export default router;