import { Prisma, ActivityType, Achievement, UserAchievement, TaskStatus } from '@prisma/client';
import {
  createAchievement,
  findAchievementById,
  findAchievementByName,
  findAllAchievements,
  updateAchievement,
  deleteAchievement,
  awardUserAchievement,
  findUserAchievement,
  findUserAchievements,
  countUserAchievements,
} from '../repositories/achievement.repository';
import { createActivityLog } from '../repositories/activityLog.repository';
import { findUserById } from '../repositories/user.repository';
import { CreateAchievementInput, UpdateAchievementInput } from '../schemas/achievement.schema';
import prisma from '../utils/prisma';

export const createNewAchievement = async (data: CreateAchievementInput): Promise<Achievement> => {
  const existingAchievement = await findAchievementByName(data.name);
  if (existingAchievement) {
    throw { statusCode: 409, message: 'Achievement with this name already exists.' };
  }
  const achievement = await createAchievement(data);
  return achievement;
};

export const getAchievementDetails = async (id: string): Promise<Achievement | null> => {
  const achievement = await findAchievementById(id);
  if (!achievement) {
    throw { statusCode: 404, message: 'Achievement not found.' };
  }
  return achievement;
};

export const getAllAchievements = async (): Promise<Achievement[]> => {
  return findAllAchievements();
};

export const updateAchievementDetails = async (id: string, data: UpdateAchievementInput): Promise<Achievement> => {
  const achievement = await findAchievementById(id);
  if (!achievement) {
    throw { statusCode: 404, message: 'Achievement not found.' };
  }
  const updatedAchievement = await updateAchievement(id, data);
  return updatedAchievement;
};

export const deleteAchievementById = async (id: string): Promise<Achievement> => {
  const achievement = await findAchievementById(id);
  if (!achievement) {
    throw { statusCode: 404, message: 'Achievement not found.' };
  }
  // Optionally, check if any users have this achievement before deleting
  const usersWithAchievement = await prisma.userAchievement.count({ where: { achievementId: id } });
  if (usersWithAchievement > 0) {
    throw { statusCode: 400, message: 'Cannot delete achievement that has been earned by users.' };
  }

  await deleteAchievement(id);
  return achievement;
};

export const getUserAchievements = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const achievements = await findUserAchievements(userId, { skip, take: limit });
  const total = await countUserAchievements(userId);
  return { achievements, total, page, limit };
};

// --- Core Gamification Logic for Achievements ---

// This function will be called by other services (e.g., gamification.service)
// to check if a user has earned any new achievements based on their current state.
export const checkAndAwardAchievements = async (userId: string, transaction: Prisma.TransactionClient) => {
  const user = await transaction.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          assignedTasks: { where: { status: TaskStatus.done } },
        },
      },
    },
  });

  if (!user) {
    console.warn(`User ${userId} not found for achievement check.`);
    return;
  }

  const allAchievements = await findAllAchievements();
  const earnedAchievements = await findUserAchievements(userId);
  const earnedAchievementIds = new Set(earnedAchievements.map(ua => ua.achievementId));

  for (const achievement of allAchievements) {
    if (earnedAchievementIds.has(achievement.id)) {
      continue; // Already earned
    }

    let isEarned = false;
    // Implement specific criteria checks here
    // This is a simplified example. In a real app, `criteria` could be a JSON object
    // or a more structured field that allows for dynamic evaluation.
    if (achievement.criteria.includes('points')) {
      const pointsThreshold = parseInt(achievement.criteria.split(' ')[1]); // e.g., "Reach 100 points" -> 100
      if (!isNaN(pointsThreshold) && user.connectaPoints >= pointsThreshold) {
        isEarned = true;
      }
    } else if (achievement.criteria.includes('tasks completed')) {
      const tasksCompletedThreshold = parseInt(achievement.criteria.split(' ')[1]); // e.g., "Complete 10 tasks" -> 10
      if (!isNaN(tasksCompletedThreshold) && user._count.assignedTasks >= tasksCompletedThreshold) {
        isEarned = true;
      }
    } else if (achievement.criteria.includes('streak')) {
      const streakThreshold = parseInt(achievement.criteria.split(' ')[1]); // e.g., "Maintain a 5-day streak" -> 5
      if (!isNaN(streakThreshold) && user.streakCurrent >= streakThreshold) {
        isEarned = true;
      }
    }
    // Add more criteria as needed (e.g., "Create 3 teams", "Be a leader")

    if (isEarned) {
      await awardUserAchievement(userId, achievement.id, transaction);
      await createActivityLog({
        user: { connect: { id: userId } },
        type: ActivityType.ACHIEVEMENT_EARNED,
        description: `Earned achievement: "${achievement.name}"!`,
      }, transaction);
      console.log(`User ${user.name} earned achievement: ${achievement.name}`);
    }
  }
};