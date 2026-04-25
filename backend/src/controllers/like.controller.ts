import { Request, Response, NextFunction } from 'express';
import { toggleProjectLike, hasUserLikedProject } from '../services/like.service';

export const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const result = await toggleProjectLike(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getLikeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const liked = await hasUserLikedProject(id, userId);
    res.json({ liked });
  } catch (error) {
    next(error);
  }
};
