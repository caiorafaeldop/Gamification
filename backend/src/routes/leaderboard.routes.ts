import { Router } from 'express';
import { getGlobalLeaderboard, getProjectLeaderboard, getWeeklyLeaderboard } from '../controllers/leaderboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { paginationSchema, uuidSchema } from '../utils/zod';
import { z } from 'zod'; // Importar z para usar z.object

const router = Router();

router.use(authenticate); // All leaderboard routes require authentication

router.get('/global', validate(paginationSchema.partial()), getGlobalLeaderboard);
// Corrigido: uuidSchema é um ZodString, não tem .shape. Deve ser envolvido em z.object.
router.get('/project/:projectId', validate(paginationSchema.partial().extend({ params: z.object({ projectId: uuidSchema }) })), getProjectLeaderboard);
router.get('/weekly', validate(paginationSchema.partial()), getWeeklyLeaderboard);

export default router;