import { Request, Response, NextFunction } from 'express';
import { getProjectBoard, createColumnService, updateColumnService, deleteColumnService, moveTaskService, reorderColumnsService } from '../services/kanban.service';

export const getProjectKanban = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const result = await getProjectBoard(projectId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createColumn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, title, order, color } = req.body;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const result = await createColumnService(projectId, title, order, userId, userRole, color);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateColumn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { columnId } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const result = await updateColumnService(columnId, req.body, userId, userRole);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteColumn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { columnId } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    await deleteColumnService(columnId, userId, userRole);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const moveTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const { columnId } = req.body;
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';
    const result = await moveTaskService(taskId, columnId, userId, isAdmin);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const reorderColumns = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, columnIds } = req.body;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const result = await reorderColumnsService(projectId, columnIds, userId, userRole);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
