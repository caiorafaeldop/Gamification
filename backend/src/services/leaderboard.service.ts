import prisma from '../utils/prisma';
import { User, Project, Role, ActivityType } from '@prisma/client';

export const getGlobalLeaderboard = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: { connectaPoints: 'desc' },
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      avatarColor: true,
      avatarUrl: true,
      connectaPoints: true,
      streakCurrent: true,
      streakBest: true,
      tier: { select: { name: true, icon: true } },
    },
  });
  const totalUsers = await prisma.user.count({ where: { isActive: true } });
  return { users, total: totalUsers, page, limit };
};

export const getProjectLeaderboard = async (projectId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        skip,
        take: limit,
        orderBy: { user: { connectaPoints: 'desc' } },
        where: { user: { isActive: true } },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarColor: true,
              avatarUrl: true,
              connectaPoints: true,
              streakCurrent: true,
              streakBest: true,
              tier: { select: { name: true, icon: true } },
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw { statusCode: 404, message: 'Project not found.' };
  }

  const members = project.members.map(tm => tm.user);
  const totalMembers = await prisma.projectMember.count({ where: { projectId, user: { isActive: true } } });

  return { projectName: project.title, members, total: totalMembers, page, limit };
};

export const getWeeklyLeaderboard = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // This is a simplified weekly leaderboard based on points gained in the last week.
  // A more robust solution would involve tracking weekly points separately or more complex activity log aggregation.
  // For now, we'll fetch users and filter/sort by recent activity or a proxy.
  // A direct "points gained this week" is not easily queryable without a dedicated field or complex aggregation.
  // Let's just return the global leaderboard for now, and mention this limitation.
  // Or, we can fetch all users and calculate points gained from activity logs, which is expensive.

  // For simplicity, let's return users who have completed tasks in the last week, ordered by their current points.
  // This is a proxy, not strictly "points gained this week".
  const usersWithRecentActivity = await prisma.user.findMany({
    where: {
      isActive: true,
      activityLogs: {
        some: {
          createdAt: { gte: oneWeekAgo },
          type: ActivityType.TASK_COMPLETED,
        },
      },
    },
    orderBy: { connectaPoints: 'desc' }, // Order by total points, not just weekly gained
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      connectaPoints: true,
      streakCurrent: true,
      streakBest: true,
      tier: { select: { name: true, icon: true } },
    },
    skip,
    take: limit,
  });

  const totalUsers = await prisma.user.count({
    where: {
      isActive: true,
      activityLogs: {
        some: {
          createdAt: { gte: oneWeekAgo },
          type: ActivityType.TASK_COMPLETED,
        },
      },
    },
  });

  return { users: usersWithRecentActivity, total: totalUsers, page, limit };
};