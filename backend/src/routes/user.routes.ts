import { Router } from 'express';
import { getMyProfile, getUserProfile, updateUserDetails, adjustUserPoints, getUserActivity, getAllUsers, promoteUserRole, toggleUserActiveStatus, uploadAvatar } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { getUserByIdSchema, updateUserSchema, updateUserPointsSchema, getUserActivitySchema } from '../schemas/user.schema';
import { Role } from '@prisma/client';
import { paginationSchema } from '../utils/zod';

const router = Router();

router.use(authenticate); // All user routes require authentication

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/me', getMyProfile);

router.post('/upload-avatar', upload.single('image'), uploadAvatar);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', authorize([Role.ADMIN, Role.LEADER, Role.MEMBER]), validate(paginationSchema.partial()), getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get('/:id', validate(getUserByIdSchema), getUserProfile);

router.patch('/:id', validate(updateUserSchema), updateUserDetails); // User can update their own profile, admin can update any
router.patch('/:id/points', authorize([Role.ADMIN]), validate(updateUserPointsSchema), adjustUserPoints); // Admin only
router.get('/:id/activity', validate(getUserActivitySchema), getUserActivity);

// Admin specific user management routes
router.patch('/:id/promote', authorize([Role.ADMIN]), validate(getUserByIdSchema), promoteUserRole); // Admin can promote/demote
router.patch('/:id/toggle-active', authorize([Role.ADMIN]), validate(getUserByIdSchema), toggleUserActiveStatus); // Admin can activate/deactivate

export default router;