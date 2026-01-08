import { Request, Response, NextFunction } from 'express';
import { createNewTask, getTaskDetails as getTaskDetailsService, updateTaskDetails as updateTaskDetailsService, moveTaskStatus, deleteTaskById, getKanbanBoardForProject as getKanbanBoardForProjectService, getMyNextTasks as getMyNextTasksService } from '../services/task.service';
import { CreateTaskInput, UpdateTaskInput, MoveTaskInput } from '../schemas/task.schema';

export const createTask = async (req: Request<{}, {}, CreateTaskInput>, res: Response, next: NextFunction) => {
  try {
    const createdById = req.user!.userId;
    const task = await createNewTask(req.body, createdById);
    res.status(201).json(task);
  } catch (error: any) {
    next(error);
  }
};

export const getTask = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const task = await getTaskDetailsService(id);
    res.status(200).json(task);
  } catch (error: any) {
    next(error);
  }
};

export const updateTask = async (req: Request<{ id: string }, {}, UpdateTaskInput>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user!.userId;
    const requestingUserRole = req.user!.role;
    const updatedTask = await updateTaskDetailsService(id, req.body, requestingUserId, requestingUserRole);
    res.status(200).json(updatedTask);
  } catch (error: any) {
    next(error);
  }
};

export const moveTask = async (req: Request<{ id: string }, {}, MoveTaskInput>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user!.userId;
    const requestingUserRole = req.user!.role;
    const movedTask = await moveTaskStatus(id, req.body, requestingUserId, requestingUserRole);
    res.status(200).json(movedTask);
  } catch (error: any) {
    next(error);
  }
};

export const deleteTask = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user!.userId;
    const requestingUserRole = req.user!.role;
    const deletedTask = await deleteTaskById(id, requestingUserId, requestingUserRole);
    res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error: any) {
    next(error);
  }
};

export const getProjectKanban = async (req: Request<{ projectId: string }>, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const kanban = await getKanbanBoardForProjectService(projectId);
    res.status(200).json(kanban);
  } catch (error: any) {
    next(error);
  }
};

export const getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const tasks = await getMyNextTasksService(userId);
    res.status(200).json(tasks);
  } catch (error: any) {
    next(error);
  }
};
