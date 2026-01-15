import prisma from '../utils/prisma';
import { Prisma, Achievement, UserAchievement } from '@prisma/client';

export const createAchievement = async (data: Prisma.AchievementCreateInput): Promise<Achievement> => {
  return prisma.achievement.create({ data });
};

export const findAchievementById = async (id: string): Promise<Achievement | null> => {
  return prisma.achievement.findUnique({ where: { id } });
};

export const findAchievementByName = async (name: string): Promise<Achievement | null> => {
  return prisma.achievement.findUnique({ where: { name } });
};

export const findAllAchievements = async (transaction?: Prisma.TransactionClient): Promise<Achievement[]> => {
  const client = transaction || prisma;
  return client.achievement.findMany({ orderBy: { name: 'asc' } });
};

export const updateAchievement = async (id: string, data: Prisma.AchievementUpdateInput): Promise<Achievement> => {
  return prisma.achievement.update({ where: { id }, data });
};

export const deleteAchievement = async (id: string): Promise<Achievement> => {
  return prisma.achievement.delete({ where: { id } });
};

export const awardUserAchievement = async (userId: string, achievementId: string, transaction?: Prisma.TransactionClient): Promise<UserAchievement> => {
  const client = transaction || prisma;
  return client.userAchievement.create({
    data: { userId, achievementId },
  });
};

export const findUserAchievement = async (userId: string, achievementId: string): Promise<UserAchievement | null> => {
  return prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: { userId, achievementId },
    },
  });
};

export const findUserAchievements = async (userId: string, params?: {
  skip?: number;
  take?: number;
  orderBy?: Prisma.UserAchievementOrderByWithRelationInput;
}, transaction?: Prisma.TransactionClient): Promise<UserAchievement[]> => {
  const client = transaction || prisma;
  const { skip, take, orderBy } = params || {};
  return client.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    skip,
    take,
    orderBy: orderBy || { earnedAt: 'desc' },
  });
};

export const countUserAchievements = async (userId: string): Promise<number> => {
  return prisma.userAchievement.count({ where: { userId } });
};