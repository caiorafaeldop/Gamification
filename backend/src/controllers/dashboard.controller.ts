import { Request, Response, NextFunction } from 'express';
import { getDashboardStats } from '../services/dashboard.service';

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Assuming user ID is attached to req.user by auth middleware
    const userId = (req as any).user?.userId;
    if (!userId) {
         throw { statusCode: 401, message: 'Unauthorized' };
    }
    const stats = await getDashboardStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
