import { Router } from 'express';
import { addComment, getComments, removeComment } from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/:taskId', getComments);
router.post('/', addComment);
router.delete('/:id', removeComment);

export default router;
