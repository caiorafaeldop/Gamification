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
  console.log(`[DEBUG_LIVE] checkAndAwardAchievements START for ${userId}`);
  const user = await transaction.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          assignedTasks: { where: { status: TaskStatus.done } },
          memberOfProjects: true,
          createdTasks: true,
          leaderOfProjects: { where: { progress: 100 } },
        },
      },
      memberOfProjects: {
        include: {
          project: {
            select: { progress: true }
          }
        }
      },
      assignedTasks: {
        where: {
          status: TaskStatus.done,
          tags: { has: 'bug' }
        },
        take: 1
      }
    },
  });

  if (!user) {
    console.warn(`User ${userId} not found for achievement check.`);
    return;
  }

  // Get weekly points
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyPointsResult = await transaction.activityLog.aggregate({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo },
      pointsChange: { not: null }
    },
    _sum: {
      pointsChange: true
    }
  });
  const weeklyPoints = weeklyPointsResult._sum.pointsChange || 0;

  const completedProjectsCount = user.memberOfProjects.filter(m => m.project.progress === 100).length;

  const allAchievements = await findAllAchievements(transaction);
  const earnedAchievements = await findUserAchievements(userId, undefined, transaction);
  const earnedAchievementIds = new Set(earnedAchievements.map(ua => ua.achievementId));

  for (const achievement of allAchievements) {
    if (earnedAchievementIds.has(achievement.id)) {
      continue; // Already earned
    }

    let isEarned = false;
    console.log(`[DEBUG_LIVE] Checking: ${achievement.name} (${achievement.criteria})`);

    // Implement specific criteria checks here
    if (achievement.criteria.startsWith('weekly_points >=')) {
      const threshold = parseInt(achievement.criteria.split('>=')[1].trim());
      if (!isNaN(threshold) && weeklyPoints >= threshold) {
        isEarned = true;
      }
    } else if (achievement.criteria.includes('points')) {
      // Handle total points criteria like "points >= 100" or similar
      const match = achievement.criteria.match(/points\s*>=\s*(\d+)/);
      const pointsThreshold = match ? parseInt(match[1]) : parseInt(achievement.criteria.split(' ')[1]);
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
    } else if (achievement.criteria === 'first_project') {
      if (user._count.memberOfProjects > 0) {
        isEarned = true;
      }
    } else if (achievement.criteria === 'first_task') {
      if (user._count.createdTasks > 0) {
        isEarned = true;
      }
    } else if (achievement.criteria === 'profile_completed') {
      if (user.avatarColor && user.course) {
        isEarned = true;
      }
    } else if (achievement.criteria === 'max_score_project') {
      if (completedProjectsCount >= 1) {
        isEarned = true;
      }
    } else if (achievement.criteria === 'lead_team >= 1') {
      if (user._count.leaderOfProjects > 0) {
        isEarned = true;
      }
    } else if (achievement.criteria === 'bug_report_validated') {
      if (user.assignedTasks.length > 0) {
        isEarned = true;
      }
    } else if (achievement.criteria === 'legendary_status') {
      if (completedProjectsCount >= 10) {
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
      console.log(`[SUCCESS] User ${user.name} earned achievement: ${achievement.name}`);
    }
  }
};