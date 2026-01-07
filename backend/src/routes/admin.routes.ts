import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';
import { resetDailyStreaks } from '../controllers/adminGamification.controller'; // Importar o novo controlador

const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));

// Exemplo: A route for global analytics, if it were a separate endpoint
// router.get('/analytics', getGlobalAnalytics);

// Nova rota para resetar sequências diárias
router.post('/reset-streaks', resetDailyStreaks);

export default router;