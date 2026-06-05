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
import {
  createProjectVersion,
  deleteProjectVersion,
  listProjectVersions,
  updateProjectVersion,
} from '../controllers/projectVersion.controller';
import { toggleLike, getLikeStatus } from '../controllers/like.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import { optionalAuth } from '../middlewares/optionalAuth';
import { validate } from '../middlewares/validation.middleware';
import {
  createProjectVersionSchema,
  deleteProjectVersionSchema,
  listProjectVersionsSchema,
  updateProjectVersionSchema,
} from '../schemas/projectVersion.schema';
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
router.get('/:id/versions', unifiedAuth, validate(listProjectVersionsSchema), listProjectVersions);
router.post('/:id/versions', unifiedAuth, validate(createProjectVersionSchema), createProjectVersion);
router.patch('/:id/versions/:versionId', unifiedAuth, validate(updateProjectVersionSchema), updateProjectVersion);
router.delete('/:id/versions/:versionId', unifiedAuth, validate(deleteProjectVersionSchema), deleteProjectVersion);
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
