import { Prisma, User, Role, ActivityType, TaskStatus } from '@prisma/client';
import { findUserById, findUsers, updateUser, updateFamenePoints, updateManyUsers } from '../repositories/user.repository';
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
        include: { project: { select: { id: true, title: true, description: true, coverUrl: true } } },
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

  // Cast to any to access potentially hidden fields or check if they exist
  let userWithExtras = user as any;

  // If the generated client doesn't include these fields, fetch them manually
  if (userWithExtras.bio === undefined || userWithExtras.skills === undefined || userWithExtras.avatarUrl === undefined) {
    console.warn('Prisma fetch missing new fields (Client sync issue), manual fetch via raw SQL...');
    const rawResult: any[] = await prisma.$queryRawUnsafe(
      'SELECT "bio", "skills", "avatarUrl" FROM "User" WHERE "id" = $1',
      userId
    );
    if (rawResult && rawResult[0]) {
      userWithExtras.bio = rawResult[0].bio;
      userWithExtras.skills = rawResult[0].skills;
      userWithExtras.avatarUrl = rawResult[0].avatarUrl;
    }
  }

  // Exclude sensitive data
  const { passwordHash, ...userWithoutHash } = userWithExtras;
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

  const updateResult = await prisma.$transaction(async (tx) => {
    const updatedUser = await updateUser(userId, data, tx);
    return updatedUser;
  });

  console.log(`[TRIGGER] User updated, checking achievements for ${userId} (Async)`);
  checkAndAwardAchievements(userId).catch(err => console.error(err));

  const { passwordHash, ...userWithoutHash } = updateResult;
  return userWithoutHash;
  try {
    const updatedUser = await updateUser(userId, data);
    const { passwordHash, ...userWithoutHash } = updatedUser;
    return userWithoutHash;
  } catch (error: any) {
    // If Prisma validation fails because bio/skills don't exist in the generated client yet
    if (error.code === 'P2002' || error.message?.includes('Unknown arg')) {
      console.warn('Prisma update failed (Client sync issue), falling back to raw SQL...');

      // Manual update via raw SQL
      const { bio, skills, name, course, avatarColor, avatarUrl } = data as any;
      const userAny = user as any;

      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET 
            "name" = $1, 
            "course" = $2, 
            "avatarColor" = $3, 
            "bio" = $4, 
            "skills" = $5,
            "avatarUrl" = $6
          WHERE "id" = $7`,
        name || userAny.name,
        course || userAny.course,
        avatarColor || userAny.avatarColor,
        bio || userAny.bio,
        skills || userAny.skills || [],
        avatarUrl || userAny.avatarUrl,
        userId
      );

      const updated = await findUserById(userId);
      const { passwordHash, ...userWithoutHash } = updated!;
      return userWithoutHash;
    }
    throw error;
  }
};

export const adjustUserPoints = async (userId: string, data: UpdateUserPointsInput, adminId: string) => {
  return prisma.$transaction(async (tx) => {
    const user = await findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found.' };
    }

    const updatedUser = await updateFamenePoints(userId, data.points, tx);

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
    orderBy: { famenePoints: 'desc' },
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