import { Router } from 'express';
import {
  createProject,
  getProjectDetails,
  getProjects,
  joinProject,
  uploadProjectCover,
  updateProject,
  leaveProject,
  transferOwnership,
  deleteProject,
  registerInterest,
  getCatalog,
  requestJoinProjectController,
  listProjectJoinRequestsController,
  respondToProjectJoinRequestController,
} from '../controllers/project.controller';
import { toggleLike, getLikeStatus } from '../controllers/like.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import { optionalAuth } from '../middlewares/optionalAuth';
import upload from '../middlewares/upload.middleware';

const router = Router();

// Rotas públicas (com auth opcional para enriquecer resposta quando logado)
router.get('/catalog', optionalAuth, getCatalog);
router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProjectDetails);
router.get('/:id/like', optionalAuth, getLikeStatus);

// Rotas protegidas (exigem login)
router.post('/upload-cover', unifiedAuth, upload.single('image') as any, uploadProjectCover);
router.post('/', unifiedAuth, createProject);
router.patch('/:id', unifiedAuth, updateProject);
router.post('/:id/join', unifiedAuth, joinProject);
router.post('/:id/interest', unifiedAuth, registerInterest);
router.post('/:id/request-join', unifiedAuth, requestJoinProjectController);
router.get('/:id/join-requests', unifiedAuth, listProjectJoinRequestsController);
router.post('/join-requests/:requestId/respond', unifiedAuth, respondToProjectJoinRequestController);
router.post('/:id/like', unifiedAuth, toggleLike);
router.delete('/:id/leave', unifiedAuth, leaveProject);
router.put('/:id/transfer-ownership', unifiedAuth, transferOwnership);
router.delete('/:id', unifiedAuth, deleteProject);

export default router;
