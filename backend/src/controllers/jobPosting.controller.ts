import { Request, Response, NextFunction } from 'express';
import { JobPostingStatus } from '@prisma/client';
import {
  createJobPosting,
  listJobPostings,
  getJobPostingById,
  updateJobPosting,
  deleteJobPosting,
} from '../services/jobPosting.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { title, description, contact, groupId } = req.body;
    const job = await createJobPosting(userId, { title, description, contact, groupId });
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as JobPostingStatus | undefined;
    const groupId = req.query.groupId as string | undefined;
    const authorId = req.query.authorId as string | undefined;

    const validStatuses: JobPostingStatus[] = ['OPEN', 'CLOSED', 'FILLED'];
    const safeStatus = status && validStatuses.includes(status) ? status : undefined;

    const jobs = await listJobPostings({ status: safeStatus, groupId, authorId });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

export const detail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await getJobPostingById(req.params.id);
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { title, description, contact, groupId, status } = req.body;
    const job = await updateJobPosting(req.params.id, userId, {
      title,
      description,
      contact,
      groupId,
      status,
    });
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const result = await deleteJobPosting(req.params.id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
