import { Router } from 'express';
import { rankingController } from '../controllers/ranking.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Ranking
 *   description: Weekly ranking and hall of fame
 */

/**
 * @swagger
 * /ranking/hall-of-fame:
 *   get:
 *     summary: Get the Hall of Fame for a specific year
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: The year to fetch the 52 weeks hall of fame
 *     responses:
 *       200:
 *         description: 52 slots with ranking data or null
 */
router.get('/hall-of-fame', unifiedAuth, rankingController.getHallOfFame);

/**
 * @swagger
 * /ranking/arts:
 *   get:
 *     summary: Get weekly rankings for generating social media arts
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit the number of records returned
 *     responses:
 *       200:
 *         description: List of rankings that may need art generation
 */
router.get('/arts', unifiedAuth, rankingController.getArts);

export default router;
