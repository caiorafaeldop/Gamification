import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.post('/:id/read', markAsRead);

export default router;
