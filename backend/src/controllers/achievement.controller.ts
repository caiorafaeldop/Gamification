import { Request, Response, NextFunction } from 'express';
import {
  createNewAchievement,
  getAchievementDetails,
  getAllAchievements,
  updateAchievementDetails,
  deleteAchievementById,
  getUserAchievements,
} from '../services/achievement.service';
import { CreateAchievementInput, UpdateAchievementInput } from '../schemas/achievement.schema';

export const createAchievement = async (req: Request<{}, {}, CreateAchievementInput>, res: Response, next: NextFunction) => {
  try {
    const achievement = await createNewAchievement(req.body);
    res.status(201).json(achievement);
  } catch (error: any) {
    next(error);
  }
};

export const getAchievement = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const achievement = await getAchievementDetails(id);
    res.status(200).json(achievement);
  } catch (error: any) {
    next(error);
  }
};

export const getAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const achievements = await getAllAchievements();
    res.status(200).json(achievements);
  } catch (error: any) {
    next(error);
  }
};

export const updateAchievement = async (req: Request<{ id: string }, {}, UpdateAchievementInput>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedAchievement = await updateAchievementDetails(id, req.body);
    res.status(200).json(updatedAchievement);
  } catch (error: any) {
    next(error);
  }
};

export const deleteAchievement = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedAchievement = await deleteAchievementById(id);
    res.status(200).json({ message: 'Achievement deleted successfully', achievement: deletedAchievement });
  } catch (error: any) {
    next(error);
  }
};

export const getMyAchievements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await getUserAchievements(userId, page, limit);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getUserAchievementsById = async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await getUserAchievements(userId, page, limit);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
