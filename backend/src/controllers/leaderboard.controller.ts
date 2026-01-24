import { Request, Response, NextFunction } from 'express';
import { getLeaderboard as getGlobalLeaderboardService, getProjectLeaderboard as getProjectLeaderboardService } from '../services/leaderboard.service';

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const period = (req.query.period as string) || 'all';
    const result = await getGlobalLeaderboardService(period, page, limit); // Note: Service import name might need adjustment
    res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
};

export const getProjectLeaderboard = async (req: Request<{ projectId: string }>, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await getProjectLeaderboardService(projectId, page, limit);
    res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
};
