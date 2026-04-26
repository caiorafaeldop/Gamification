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

const router = Router();

router.use(unifiedAuth);

router.get('/', getGroups);
router.get('/:id', getGroup);
router.post('/', createGroup);
router.patch('/:id', updateGroup);
router.delete('/:id', deleteGroup);
router.post('/:id/join', joinGroup);
router.delete('/:id/leave', leaveGroup);
router.post('/:id/request', requestJoinGroup);
router.post('/:id/requests/:requestId/respond', respondToJoinRequest);

export default router;
