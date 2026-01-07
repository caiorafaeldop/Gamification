import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getDashboard);

export default router;
