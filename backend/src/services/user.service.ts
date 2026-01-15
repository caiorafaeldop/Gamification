import { Prisma, User, Role, ActivityType, TaskStatus } from '@prisma/client';
import { findUserById, findUsers, updateUser, updateConnectaPoints, updateManyUsers } from '../repositories/user.repository';
import { findActivityLogsByUserId, createActivityLog } from '../repositories/activityLog.repository';
import { hashPassword } from '../utils/bcrypt';
import { UpdateUserInput, UpdateUserPointsInput } from '../schemas/user.schema';
import { recalcUserTier } from './gamification.service';
import { checkAndAwardAchievements } from './achievement.service';
import prisma from '../utils/prisma';

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tier: true,
      memberOfProjects: {
        include: { project: { select: { id: true, title: true, description: true } } },
      },
      assignedTasks: {
        where: { status: { not: TaskStatus.done } },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: { project: { select: { title: true } } },
      },
    },
  });

  if (!user) {
    throw { statusCode: 404, message: 'User not found.' };
  }

  // Exclude sensitive data
  const { passwordHash, ...userWithoutHash } = user;
  return userWithoutHash;
};

export const getUserProfile = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      tier: true,
      memberOfProjects: {
        include: { project: { select: { id: true, title: true } } },
      },
    },
  });

  if (!user) {
    throw { statusCode: 404, message: 'User not found.' };
  }

  const { passwordHash, ...userWithoutHash } = user;
  return userWithoutHash;
};

export const updateUserDetails = async (userId: string, data: UpdateUserInput, requestingUserRole: Role) => {
  const user = await findUserById(userId);
  if (!user) {
    throw { statusCode: 404, message: 'User not found.' };
  }

  // Prevent non-admins from changing roles or isActive status
  if (requestingUserRole !== Role.ADMIN) {
    if (data.role && data.role !== user.role) {
      throw { statusCode: 403, message: 'Only administrators can change user roles.' };
    }
    if (data.isActive !== undefined && data.isActive !== user.isActive) {
      throw { statusCode: 403, message: 'Only administrators can change user active status.' };
    }
  }

  if (data.password) {
    data.password = await hashPassword(data.password);
  }

  return prisma.$transaction(async (tx) => {
    const updatedUser = await updateUser(userId, data, tx);
    console.log(`[TRIGGER] User updated, checking achievements for ${userId}`);
    await checkAndAwardAchievements(userId, tx);
    const { passwordHash, ...userWithoutHash } = updatedUser;
    return userWithoutHash;
  });
};

export const adjustUserPoints = async (userId: string, data: UpdateUserPointsInput, adminId: string) => {
  return prisma.$transaction(async (tx) => {
    const user = await findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    const updatedUser = await updateConnectaPoints(userId, data.points, tx);

    await createActivityLog({
      user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
      type: ActivityType.POINTS_ADJUSTED,
      description: `Points adjusted by admin (${adminId}): ${data.points > 0 ? '+' : ''}${data.points} for "${data.reason}"`,
      pointsChange: data.points,
    }, tx);

    await recalcUserTier(userId, tx);

    const { passwordHash, ...userWithoutHash } = updatedUser;
    return userWithoutHash;
  });
};

export const getUserActivity = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const activities = await findActivityLogsByUserId(userId, limit); // No skip for now, just take latest
  return activities;
};

export const getAllUsers = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const users = await findUsers({
    skip,
    take: limit,
    orderBy: { connectaPoints: 'desc' },
  });
  const total = await prisma.user.count();
  return { users: users.map(({ passwordHash, ...user }) => user), total, page, limit };
};

export const promoteUserRole = async (userId: string, newRole: Role, adminId: string) => {
  if (newRole === Role.ADMIN) {
    throw { statusCode: 403, message: 'Cannot promote to ADMIN via this endpoint.' };
  }
  return prisma.$transaction(async (tx) => {
    const user = await findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }
    if (user.role === newRole) {
      return user; // No change needed
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

export const deactivateUser = async (userId: string, adminId: string) => {
  return prisma.$transaction(async (tx) => {
    const user = await findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }
    if (user.role === Role.ADMIN && user.id !== adminId) { // Prevent admin from deactivating other admins
      throw { statusCode: 403, message: 'Cannot deactivate another admin.' };
    }
    const updatedUser = await updateUser(userId, { isActive: false }, tx);
    await createActivityLog({
      user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
      type: ActivityType.USER_STATUS_CHANGED, // Usar um tipo mais específico
      description: `User deactivated by admin (${adminId}).`,
    }, tx);
    return updatedUser;
  });
};

export const activateUser = async (userId: string, adminId: string) => {
  return prisma.$transaction(async (tx) => {
    const user = await findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }
    const updatedUser = await updateUser(userId, { isActive: true }, tx);
    await createActivityLog({
      user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
      type: ActivityType.USER_STATUS_CHANGED, // Usar um tipo mais específico
      description: `User activated by admin (${adminId}).`,
    }, tx);
    return updatedUser;
  });
};