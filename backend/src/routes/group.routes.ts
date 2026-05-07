import { Router } from 'express';
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  requestJoinGroup,
  respondToJoinRequest
} from '../controllers/group.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import { optionalAuth } from '../middlewares/optionalAuth';

const router = Router();

// Listagem pública (mostra que o grupo existe; detalhes só logado)
router.get('/', optionalAuth, getGroups);

// Detalhes e tudo mais exigem login
router.get('/:id', unifiedAuth, getGroup);
router.post('/', unifiedAuth, createGroup);
router.patch('/:id', unifiedAuth, updateGroup);
router.delete('/:id', unifiedAuth, deleteGroup);
router.post('/:id/join', unifiedAuth, joinGroup);
router.delete('/:id/leave', unifiedAuth, leaveGroup);
router.post('/:id/request', unifiedAuth, requestJoinGroup);
router.post('/:id/requests/:requestId/respond', unifiedAuth, respondToJoinRequest);

export default router;
