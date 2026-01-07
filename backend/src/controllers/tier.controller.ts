import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { createNewTier, getTierDetails as getTierDetailsService, getAllTiers as getAllTiersService, updateTierDetails as updateTierDetailsService, deleteTierById } from '../services/tier.service';

export const createTier = async (req: Request<object, object, Prisma.TierCreateInput>, res: Response, next: NextFunction) => {
  try {
    const tier = await createNewTier(req.body);
    res.status(201).json(tier);
  } catch (error: unknown) {
    next(error);
  }
};

export const getTier = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tier = await getTierDetailsService(id);
    res.status(200).json(tier);
  } catch (error: unknown) {
    next(error);
  }
};

export const getTiers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tiers = await getAllTiersService();
    res.status(200).json(tiers);
  } catch (error: unknown) {
    next(error);
  }
};

export const updateTier = async (req: Request<{ id: string }, object, Prisma.TierUpdateInput>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedTier = await updateTierDetailsService(id, req.body);
    res.status(200).json(updatedTier);
  } catch (error: unknown) {
    next(error);
  }
};

export const deleteTier = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedTier = await deleteTierById(id);
    res.status(200).json({ message: 'Tier deleted successfully', tier: deletedTier });
  } catch (error: unknown) {
    next(error);
  }
};
