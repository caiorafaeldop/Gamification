import { Router } from 'express';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import { authorize } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Apply authentication and admin authorization to ALL admin routes
router.use(unifiedAuth, authorize([Role.ADMIN]));

// Projects
router.get('/projects', adminController.getAllProjects);
router.put('/projects/:projectId', adminController.updateProject);

// Users
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId/points', adminController.updateUserPoints);
router.delete('/users/:userId', adminController.deleteUser);

// Logs
router.get('/logs', adminController.getAdminLogs);

export default router;
