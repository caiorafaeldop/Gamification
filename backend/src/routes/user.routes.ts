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

router.get('/me', getMyProfile);
router.post('/upload-avatar', upload.single('image'), uploadAvatar);
// Alterado: Agora permite ADMIN, LEADER e MEMBER para listar todos os usuários.
// Isso é necessário para funcionalidades como atribuir tarefas ou adicionar membros a equipes.
router.get('/', authorize([Role.ADMIN, Role.LEADER, Role.MEMBER]), validate(paginationSchema.partial()), getAllUsers);
router.get('/:id', validate(getUserByIdSchema), getUserProfile);
router.patch('/:id', validate(updateUserSchema), updateUserDetails); // User can update their own profile, admin can update any
router.patch('/:id/points', authorize([Role.ADMIN]), validate(updateUserPointsSchema), adjustUserPoints); // Admin only
router.get('/:id/activity', validate(getUserActivitySchema), getUserActivity);

// Admin specific user management routes
router.patch('/:id/promote', authorize([Role.ADMIN]), validate(getUserByIdSchema), promoteUserRole); // Admin can promote/demote
router.patch('/:id/toggle-active', authorize([Role.ADMIN]), validate(getUserByIdSchema), toggleUserActiveStatus); // Admin can activate/deactivate

export default router;