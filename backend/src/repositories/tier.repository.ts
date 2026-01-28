import prisma from '../utils/prisma';
import { Prisma, Tier } from '@prisma/client';

export const createTier = async (data: Prisma.TierCreateInput): Promise<Tier> => {
  return prisma.tier.create({ data });
};

export const findTierById = async (id: string): Promise<Tier | null> => {
  return prisma.tier.findUnique({ where: { id } });
};

export const findTierByName = async (name: string): Promise<Tier | null> => {
  return prisma.tier.findUnique({ where: { name } });
};

export const findAllTiers = async (transaction?: Prisma.TransactionClient): Promise<Tier[]> => {
  const client = transaction || prisma;
  return client.tier.findMany({ orderBy: { order: 'asc' } });
};

export const updateTier = async (id: string, data: Prisma.TierUpdateInput): Promise<Tier> => {
  return prisma.tier.update({ where: { id }, data });
};

export const deleteTier = async (id: string): Promise<Tier> => {
  return prisma.tier.delete({ where: { id } });
};

export const findTierByPoints = async (points: number, transaction?: Prisma.TransactionClient): Promise<Tier> => {
  const client = transaction || prisma;
  const tier = await client.tier.findMany({
    where: { minPoints: { lte: points } },
    orderBy: { minPoints: 'desc' },
    take: 1,
  });
  return tier[0];
};
