import { Prisma, User, Tier, ActivityType, TaskStatus } from '@prisma/client';
import { updateConnectaPoints, updateUserTier, updateStreak, updateLastActivity } from '../repositories/user.repository';
import { createActivityLog } from '../repositories/activityLog.repository';
import { findTierByPoints, findAllTiers } from '../repositories/tier.repository';
import { checkAndAwardAchievements } from './achievement.service'; // Import the new service
import prisma from '../utils/prisma';

// Points per task difficulty are defined in task.service.ts, but can be centralized here if needed.

export const addPointsForTaskCompletion = async (userId: string, points: number, taskId: string, transaction: Prisma.TransactionClient) => {
  const updatedUser = await updateConnectaPoints(userId, points, transaction);
  await createActivityLog({
    user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
    type: ActivityType.TASK_COMPLETED,
    description: `Completed a task and earned ${points} Connecta Points.`,
    pointsChange: points,
  }, transaction);
  await recalcUserTier(userId, transaction);
  await checkAndAwardAchievements(userId, transaction); // Check for achievements after points update
  return updatedUser;
};

export const recalcUserTier = async (userId: string, transaction: Prisma.TransactionClient) => {
  const user = await transaction.user.findUnique({
    where: { id: userId },
    include: { tier: true },
  });

  if (!user) {
    throw new Error('User not found for tier recalculation.');
  }

  const currentTier = user.tier;
  const newTier = await findTierByPoints(user.connectaPoints);

  if (newTier && newTier.id !== currentTier.id) {
    await updateUserTier(userId, newTier.id, transaction);
    await createActivityLog({
      user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
      type: ActivityType.TIER_ACHIEVED,
      description: `Achieved new tier: ${newTier.name}!`,
    }, transaction);
    await checkAndAwardAchievements(userId, transaction); // Check for achievements after tier change
    return newTier;
  }
  return currentTier;
};

export const updateStreakForUser = async (userId: string, transaction: Prisma.TransactionClient) => {
  const user = await transaction.user.findUnique({
    where: { id: userId },
    select: { id: true, streakCurrent: true, streakBest: true, lastActivityAt: true },
  });

  if (!user) {
    throw new Error('User not found for streak update.');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const lastActivityDay = user.lastActivityAt ? new Date(user.lastActivityAt) : null;
  if (lastActivityDay) {
    lastActivityDay.setHours(0, 0, 0, 0);
  }

  let newStreakCurrent = user.streakCurrent;
  let newStreakBest = user.streakBest;

  // Calcula a diferença em dias entre hoje e a última atividade
  const diffTime = Math.abs(today.getTime() - (lastActivityDay?.getTime() || 0));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (!lastActivityDay || diffDays > 1) { // Se não houve atividade ontem ou antes, reseta a sequência
    newStreakCurrent = 1;
  } else if (diffDays === 1) { // Se a última atividade foi ontem, incrementa a sequência
    newStreakCurrent++;
  }
  // Se a atividade foi hoje, não faz nada (newStreakCurrent permanece o mesmo)

  if (newStreakCurrent > newStreakBest) {
    newStreakBest = newStreakCurrent;
  }

  await updateStreak(userId, newStreakCurrent, newStreakBest, transaction);
  await createActivityLog({
    user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
    type: ActivityType.STREAK_UPDATED,
    description: `Streak updated: Current ${newStreakCurrent}, Best ${newStreakBest}.`,
  }, transaction);
  await checkAndAwardAchievements(userId, transaction); // Check for achievements after streak update
};

export const checkAndResetDailyStreaks = async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999); // End of yesterday

  // Find users whose last activity was before yesterday and streak is not 0
  const usersToReset = await prisma.user.findMany({
    where: {
      lastActivityAt: { lt: yesterday },
      streakCurrent: { gt: 0 },
    },
    select: { id: true, name: true, streakCurrent: true, streakBest: true }, // Incluído streakBest
  });

  if (usersToReset.length > 0) {
    console.log(`Resetting streaks for ${usersToReset.length} users.`);
    await prisma.$transaction(async (tx) => {
      for (const user of usersToReset) {
        await updateStreak(user.id, 0, user.streakBest, tx);
        await createActivityLog({
          user: { connect: { id: user.id } }, // Corrigido: usar 'user' com 'connect'
          type: ActivityType.STREAK_UPDATED,
          description: `Streak reset to 0 due to inactivity. Previous streak: ${user.streakCurrent}.`,
        }, tx);
        await checkAndAwardAchievements(user.id, tx); // Check for achievements after streak reset
      }
    });
  }
};

// This function could be called by a cron job daily
// Example:
// import cron from 'node-cron';
// cron.schedule('0 0 * * *', () => { // Every day at midnight
//   console.log('Running daily streak check...');
//   checkAndResetDailyStreaks().catch(console.error);
// });