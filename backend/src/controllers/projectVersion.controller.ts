import { Request, Response, NextFunction } from 'express';
import {
  createProjectVersion as createProjectVersionService,
  deleteProjectVersion as deleteProjectVersionService,
  listProjectVersions as listProjectVersionsService,
  updateProjectVersion as updateProjectVersionService,
} from '../services/projectVersion.service';
import { CreateProjectVersionInput, UpdateProjectVersionInput } from '../schemas/projectVersion.schema';

export const listProjectVersions = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await listProjectVersionsService(req.params.id, req.user!.userId, req.user!.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createProjectVersion = async (
  req: Request<{ id: string }, {}, CreateProjectVersionInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await createProjectVersionService(req.params.id, req.body, req.user!.userId, req.user!.role);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateProjectVersion = async (
  req: Request<{ id: string; versionId: string }, {}, UpdateProjectVersionInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await updateProjectVersionService(
      req.params.id,
      req.params.versionId,
      req.body,
      req.user!.userId,
      req.user!.role,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteProjectVersion = async (
  req: Request<{ id: string; versionId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteProjectVersionService(req.params.id, req.params.versionId, req.user!.userId, req.user!.role);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
