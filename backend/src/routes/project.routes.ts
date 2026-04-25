import { Router } from 'express';
import { createProject, getProjectDetails, getProjects, joinProject, uploadProjectCover, updateProject, leaveProject, transferOwnership, deleteProject, registerInterest, getCatalog } from '../controllers/project.controller';
import { toggleLike, getLikeStatus } from '../controllers/like.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import upload from '../middlewares/upload.middleware';

const router = Router();

router.use(unifiedAuth);

// Public (authenticated) routes
router.post('/upload-cover', upload.single('image') as any, uploadProjectCover);
router.get('/catalog', getCatalog);
router.get('/', getProjects);
router.get('/:id', getProjectDetails);
router.post('/', createProject);
router.patch('/:id', updateProject);
router.post('/:id/join', joinProject);
router.post('/:id/interest', registerInterest);
router.post('/:id/like', toggleLike);
router.get('/:id/like', getLikeStatus);
router.delete('/:id/leave', leaveProject);
router.put('/:id/transfer-ownership', transferOwnership);
router.delete('/:id', deleteProject);

export default router;
