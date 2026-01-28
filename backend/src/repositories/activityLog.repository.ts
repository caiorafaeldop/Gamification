import prisma from '../utils/prisma';
import { Prisma, ActivityLog, ActivityType } from '@prisma/client';

export const createActivityLog = async (data: Prisma.ActivityLogCreateInput, transaction?: Prisma.TransactionClient): Promise<ActivityLog> => {
  const client = transaction || prisma;
  return client.activityLog.create({ data });
};

export const findActivityLogsByUserId = async (userId: string, take?: number): Promise<ActivityLog[]> => {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take,
  });
};

export const findRecentActivityLogs = async (take: number = 10): Promise<ActivityLog[]> => {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
};
