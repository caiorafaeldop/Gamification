import { Prisma, Role, ActivityType } from '@prisma/client';
import { findUserById, updateUser, updateManyUsers } from '../repositories/user.repository';
import { createActivityLog } from '../repositories/activityLog.repository';
import { createNewProject, deleteProjectById, updateProjectDetails } from './project.service';
import { createNewTier, updateTierDetails, deleteTierById } from './tier.service';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';
import { checkAndResetDailyStreaks } from './gamification.service'; // Importar a função de gamificação
import prisma from '../utils/prisma';

// This service centralizes admin-specific operations, often delegating to other services
// but ensuring admin-level permissions and logging.

export const adminCreateProject = async (data: CreateProjectInput, adminId: string) => {
  return createNewProject(data, adminId);
};

export const adminUpdateProject = async (projectId: string, data: UpdateProjectInput, adminId: string) => {
  return updateProjectDetails(projectId, data, adminId, Role.ADMIN);
};

export const adminDeleteProject = async (projectId: string, adminId: string) => {
  return deleteProjectById(projectId, adminId);
};

export const adminCreateTier = async (data: Prisma.TierCreateInput) => {
  return createNewTier(data);
};

export const adminUpdateTier = async (tierId: string, data: Prisma.TierUpdateInput) => {
  return updateTierDetails(tierId, data);
};

export const adminDeleteTier = async (tierId: string) => {
  return deleteTierById(tierId);
};

export const adminUpdateUserRole = async (userId: string, newRole: Role, adminId: string) => {
  return prisma.$transaction(async (tx) => {
    const user = await findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }
    if (user.id === adminId && newRole !== Role.ADMIN) {
      throw { statusCode: 400, message: 'An admin cannot demote themselves.' };
    }
    const updatedUser = await updateUser(userId, { role: newRole }, tx);
    await createActivityLog({
      user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
      type: ActivityType.ROLE_CHANGED,
      description: `Role changed to ${newRole} by admin (${adminId}).`,
    }, tx);
    return updatedUser;
  });
};

export const adminToggleUserActiveStatus = async (userId: string, isActive: boolean, adminId: string) => {
  return prisma.$transaction(async (tx) => {
    const user = await findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }
    if (user.id === adminId && !isActive) {
      throw { statusCode: 400, message: 'An admin cannot deactivate themselves.' };
    }
    const updatedUser = await updateUser(userId, { isActive }, tx);
    await createActivityLog({
      user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
      type: ActivityType.USER_STATUS_CHANGED, // Usar um tipo mais específico
      description: `User ${isActive ? 'activated' : 'deactivated'} by admin (${adminId}).`,
    }, tx);
    return updatedUser;
  });
};

export const adminOverwriteConnectaPoints = async (userId: string, points: number, reason: string, adminId: string) => {
  return prisma.$transaction(async (tx) => {
    const user = await findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }
    const updatedUser = await updateUser(userId, { connectaPoints: points }, tx);
    await createActivityLog({
      user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
      type: ActivityType.POINTS_ADJUSTED,
      description: `Connecta Points overwritten to ${points} by admin (${adminId}) for "${reason}".`,
      pointsChange: points - user.connectaPoints, // Log the change amount
    }, tx);
    return updatedUser;
  });
};

export const adminResetDailyStreaks = async (adminId: string) => {
  await checkAndResetDailyStreaks(); // Chama a função de gamificação
  await createActivityLog({
    user: { connect: { id: adminId } },
    type: ActivityType.ADMIN_ACTION, // Usar um tipo genérico para ações de admin
    description: `Admin (${adminId}) manually initiated daily streak check and reset.`,
  });
};

export const getSystemOverview = async () => {
  const [totalUsers, totalProjects, totalTasks, activeUsers] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.task.count(),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalProjects,
    totalTasks,
  };
};

export const getAllUsersService = async () => {
    return prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });
};

export const getAllProjectsService = async () => {
    return prisma.project.findMany({
        include: {
            leader: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            _count: {
                select: { tasks: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getAdminLogsService = async () => {
    return prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100, // Limite inicial de 100 logs
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            }
        }
    });
};