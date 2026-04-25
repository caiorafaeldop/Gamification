import { Request, Response, NextFunction } from 'express';
import * as groupService from '../services/group.service';

export const getGroups = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await groupService.listGroups();
    res.json(groups);
  } catch (error) {
    next(error);
  }
};

export const getGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await groupService.getGroupDetails(req.params.id);
    res.json(group);
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { name, description, color, logoUrl, bannerUrl } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Nome do grupo é obrigatório.' });
    }
    const group = await groupService.createGroup(
      { name: name.trim(), description, color, logoUrl, bannerUrl },
      userId
    );
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const group = await groupService.updateGroup(req.params.id, req.body, userId, userRole);
    res.json(group);
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    await groupService.deleteGroup(req.params.id, userId, userRole);
    res.json({ message: 'Grupo excluído.' });
  } catch (error) {
    next(error);
  }
};

export const joinGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const membership = await groupService.joinGroup(req.params.id, userId);
    res.status(201).json(membership);
  } catch (error) {
    next(error);
  }
};

export const leaveGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await groupService.leaveGroup(req.params.id, userId);
    res.json({ message: 'Você saiu do grupo.' });
  } catch (error) {
    next(error);
  }
};
