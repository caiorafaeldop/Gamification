import { Router } from 'express';
import { createProject, getProjectDetails, getProjects, joinProject, uploadProjectCover, updateProject, leaveProject, transferOwnership, deleteProject, getExploreProjects, registerInterest } from '../controllers/project.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import upload from '../middlewares/upload.middleware';

const router = Router();

router.use(unifiedAuth);

// Public (authenticated) routes
router.post('/upload-cover', upload.single('image') as any, uploadProjectCover);
router.get('/explore', getExploreProjects);
router.get('/', getProjects);
router.get('/:id', getProjectDetails);
router.post('/', createProject);
router.patch('/:id', updateProject);
router.post('/:id/join', joinProject);
router.post('/:id/interest', registerInterest);
router.delete('/:id/leave', leaveProject);
router.put('/:id/transfer-ownership', transferOwnership);
router.delete('/:id', deleteProject);

export default router;
