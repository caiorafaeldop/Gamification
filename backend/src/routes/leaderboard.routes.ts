import { Router } from 'express';
import { getLeaderboard as getGlobalLeaderboard, getProjectLeaderboard } from '../controllers/leaderboard.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import { validate } from '../middlewares/validation.middleware';
import { paginationSchema, uuidSchema } from '../utils/zod';
import { z } from 'zod';

const router = Router();

router.use(unifiedAuth);

router.get(
  '/',
  validate(
    paginationSchema.partial().extend({
      query: z.object({
        period: z.string().optional(),
        projectIds: z.string().optional(),
      }),
    })
  ),
  getGlobalLeaderboard
);

router.get('/project/:projectId', validate(paginationSchema.partial().extend({ params: z.object({ projectId: uuidSchema }) })), getProjectLeaderboard);

export default router;
