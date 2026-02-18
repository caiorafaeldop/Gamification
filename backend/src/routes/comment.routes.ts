import { Router } from 'express';
import { addComment, getComments, removeComment } from '../controllers/comment.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';

const router = Router();
router.use(unifiedAuth);

router.get('/:taskId', getComments);
router.post('/', addComment);
router.delete('/:id', removeComment);

export default router;
