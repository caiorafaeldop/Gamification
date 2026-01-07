import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const getActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    const activities = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(activities);
  } catch (error) {
    next(error);
  }
};
