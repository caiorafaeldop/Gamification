import { Request, Response, NextFunction } from 'express';
import { createComment, getTaskComments, deleteComment } from '../services/comment.service';

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId, content } = req.body;
        const userId = req.user!.userId;
        const comment = await createComment(taskId, userId, content);
        res.status(201).json(comment);
    } catch (e) { next(e); }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId } = req.params;
        const comments = await getTaskComments(taskId);
        res.json(comments);
    } catch (e) { next(e); }
}

export const removeComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await deleteComment(id);
        res.json({ message: 'Deleted' });
    } catch (e) { next(e); }
}
