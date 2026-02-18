import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';

const router = Router();

router.use(unifiedAuth);

router.get('/', getNotifications);
router.post('/:id/read', markAsRead);

export default router;
