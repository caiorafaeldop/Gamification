import prisma from '../utils/prisma';
import { User, Project, Role, ActivityType } from '@prisma/client';



export const getLeaderboard = async (period: string = 'all', page: number, limit: number) => {
  if (period === 'all') {
    return getGlobalLeaderboard(page, limit);
  }

  const skip = (page - 1) * limit;
  let fromDate = new Date();
  
  // Set start time to beginning of the period
  if (period === 'daily') {
    fromDate.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    // Start of the week (assuming Sunday as start or just 7 days ago? 
    // Usually "Weekly" in gamification means "Last 7 days" or "Current Week".
    // Let's go with "Current Week" (last 7 days could be rolling).
    // The request said "Filtro de tempo... não tem diferença". 
    // For consistency with typical leaderboards, let's use "Since comparable start".
    // But "Last 7 days" is often better for rolling activity. 
    // Let's use "Last 7 days" to ensure data is always populated if they just started.
    // Actually, distinct "Current Week" (resetting on Sunday) vs "Last 7 Days". 
    // Let's stick to "Last 7 days" logic from previous code but applied correctly, OR explicit Start of Week.
    // Given the prompt "diário, semanal, mensal", typically implies calendar periods.
    // Daily = Today. Weekly = This Week. Monthly = This Month.
    // Let's try Calendar periods as they are more competitive (everyone resets at once).
    // Daily
    fromDate.setHours(0, 0, 0, 0);
  } else if (period === 'monthly') {
    fromDate.setDate(1);
    fromDate.setHours(0, 0, 0, 0);
  } 

  // If period is 'weekly', let's actually adjust to start of week (Sunday)
  if (period === 'weekly') {
    const day = fromDate.getDay();
    const diff = fromDate.getDate() - day; // adjust when day is sunday
    fromDate.setDate(diff);
    fromDate.setHours(0, 0, 0, 0);
  }
  
  // Aggregation
  const rankings = await prisma.activityLog.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: fromDate },
      pointsChange: { not: null },
    },
    _sum: {
      pointsChange: true,
    },
    orderBy: [
      {
        _sum: {
          pointsChange: 'desc',
        },
      },
      {
        userId: 'asc',
      }
    ],
    take: limit,
    skip: skip,
  });

  // Calculate total distinct users for pagination
  const totalUsersGroups = await prisma.activityLog.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: fromDate },
    },
  });
  const totalUsers = totalUsersGroups.length;

  // Fetch user details
  const userIds = rankings.map(r => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      email: true,
      avatarColor: true,
      avatarUrl: true,
      // famenePoints: true, // This is TOTAL points. We want PERIOD points.
      streakCurrent: true,
      streakBest: true,
      tier: { select: { name: true, icon: true } },
    },
  });

  // Merge aggregated points into user objects
  const resultUsers = rankings.map(rank => {
    const user = users.find(u => u.id === rank.userId);
    if (!user) return null;
    return {
      ...user,
      points: Math.max(0, rank._sum.pointsChange || 0), // Explicitly return period points
      famenePoints: Math.max(0, rank._sum.pointsChange || 0), // Override for UI compatibility if needed, or better use 'points'
    };
  }).filter(u => u !== null)
  .sort((a, b) => (b!.points || 0) - (a!.points || 0));

  return { users: resultUsers, total: totalUsers, page, limit };
};

const getGlobalLeaderboard = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: [
      { famenePoints: 'desc' },
      { name: 'asc' }
    ],
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      avatarColor: true,
      avatarUrl: true,
      famenePoints: true,
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
        orderBy: { user: { famenePoints: 'desc' } },
        where: { user: { isActive: true } },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarColor: true,
              avatarUrl: true,
              famenePoints: true,
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

