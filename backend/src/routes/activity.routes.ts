import { Router } from 'express';
import { getActivities } from '../controllers/activity.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getActivities);

export default router;
