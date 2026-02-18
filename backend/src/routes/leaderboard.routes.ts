import { Router } from 'express';
import { getLeaderboard as getGlobalLeaderboard, getProjectLeaderboard } from '../controllers/leaderboard.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import { validate } from '../middlewares/validation.middleware';
import { paginationSchema, uuidSchema } from '../utils/zod';
import { z } from 'zod'; // Importar z para usar z.object

const router = Router();

router.use(unifiedAuth); // All leaderboard routes require authentication

router.get('/', validate(paginationSchema.partial().extend({ query: z.object({ period: z.string().optional() }) })), getGlobalLeaderboard);
// Corrigido: uuidSchema é um ZodString, não tem .shape. Deve ser envolvido em z.object.
router.get('/project/:projectId', validate(paginationSchema.partial().extend({ params: z.object({ projectId: uuidSchema }) })), getProjectLeaderboard);

export default router;
