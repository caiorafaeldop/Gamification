import { Prisma, Tier } from '@prisma/client';
import { createTier, findTierById, findAllTiers, updateTier, deleteTier, findTierByName } from '../repositories/tier.repository';
import prisma from '../utils/prisma';

export const createNewTier = async (data: Prisma.TierCreateInput) => {
  const existingTier = await findTierByName(data.name);
  if (existingTier) {
    throw { statusCode: 409, message: 'Tier with this name already exists.' };
  }
  const tier = await createTier(data);
  return tier;
};

export const getTierDetails = async (id: string) => {
  const tier = await findTierById(id);
  if (!tier) {
    throw { statusCode: 404, message: 'Tier not found.' };
  }
  return tier;
};

export const getAllTiers = async () => {
  return findAllTiers();
};

export const updateTierDetails = async (id: string, data: Prisma.TierUpdateInput) => {
  const tier = await findTierById(id);
  if (!tier) {
    throw { statusCode: 404, message: 'Tier not found.' };
  }
  const updatedTier = await updateTier(id, data);
  return updatedTier;
};

export const deleteTierById = async (id: string) => {
  const tier = await findTierById(id);
  if (!tier) {
    throw { statusCode: 404, message: 'Tier not found.' };
  }
  // Check if any users are currently in this tier before deleting
  const usersInTier = await prisma.user.count({ where: { tierId: id } });
  if (usersInTier > 0) {
    throw { statusCode: 400, message: 'Cannot delete tier with active users. Reassign users first.' };
  }
  const tasksRequiringTier = await prisma.task.count({ where: { requiredTierId: id } });
  if (tasksRequiringTier > 0) {
    throw { statusCode: 400, message: 'Cannot delete tier required by active tasks. Update tasks first.' };
  }

  await deleteTier(id);
  return tier;
};
