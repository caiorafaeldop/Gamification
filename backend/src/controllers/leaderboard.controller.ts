import { Request, Response, NextFunction } from 'express';
import { getGlobalLeaderboard as getGlobalLeaderboardService, getProjectLeaderboard as getProjectLeaderboardService, getWeeklyLeaderboard as getWeeklyLeaderboardService } from '../services/leaderboard.service';

export const getGlobalLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await getGlobalLeaderboardService(page, limit);
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

export const getWeeklyLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await getWeeklyLeaderboardService(page, limit);
    res.status(200).json(result);
  } catch (error: unknown) {
    next(error);
  }
};
