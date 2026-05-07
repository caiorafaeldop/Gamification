import { Router } from 'express';
import { rankingController } from '../controllers/ranking.controller';
import { optionalAuth } from '../middlewares/optionalAuth';

const router = Router();

// Hall of fame e arts são públicos
router.get('/hall-of-fame', optionalAuth, rankingController.getHallOfFame);
router.get('/arts', optionalAuth, rankingController.getArts);

export default router;
