import { Router } from 'express';
import { getSystemOverview } from '../controllers/stats.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: System statistics and overview
 */

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get system overview
 *     description: Returns a summary of users, projects, and events in the system. Publicly accessible.
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: System overview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [ADMIN, LEADER, MEMBER]
 *                       isActive:
 *                         type: boolean
 *                       avatarColor:
 *                         type: string
 *                       avatarUrl:
 *                         type: string
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       coverUrl:
 *                         type: string
 *                       leader:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       time:
 *                         type: string
 *                       type:
 *                         type: string
 */
router.get('/', getSystemOverview);

export default router;
