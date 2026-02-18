import { Router } from 'express';
import { getActivities } from '../controllers/activity.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';

const router = Router();

router.get('/', unifiedAuth, getActivities);

export default router;
