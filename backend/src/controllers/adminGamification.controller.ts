import { Request, Response, NextFunction } from 'express';
import { adminResetDailyStreaks } from '../services/admin.service';

export const resetDailyStreaks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.userId; // O ID do admin que está acionando
    await adminResetDailyStreaks(adminId);
    res.status(200).json({ message: 'Daily streaks check and reset initiated successfully.' });
  } catch (error: any) {
    next(error);
  }
};
