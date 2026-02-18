import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';

const router = Router();

router.get('/', unifiedAuth, getDashboard);

export default router;
