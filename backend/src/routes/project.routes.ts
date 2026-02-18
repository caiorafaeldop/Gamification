import { Router } from 'express';
import { createProject, getProjectDetails, getProjects, joinProject, uploadProjectCover, updateProject, leaveProject, transferOwnership, deleteProject } from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

// Public (authenticated) routes
router.post('/upload-cover', upload.single('image'), uploadProjectCover);
router.get('/', getProjects);
router.get('/:id', getProjectDetails);
router.post('/', createProject);
router.patch('/:id', updateProject);
router.post('/:id/join', joinProject);
router.delete('/:id/leave', leaveProject);
router.put('/:id/transfer-ownership', transferOwnership);
router.delete('/:id', deleteProject);

export default router;