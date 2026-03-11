import prisma from '../utils/prisma';

const getFromDateByPeriod = (period: string) => {
  const fromDate = new Date();

  if (period === 'daily') {
    fromDate.setHours(0, 0, 0, 0);
    return fromDate;
  }

  if (period === 'weekly') {
    const day = fromDate.getDay();
    fromDate.setDate(fromDate.getDate() - day);
    fromDate.setHours(0, 0, 0, 0);
    return fromDate;
  }

  if (period === 'monthly') {
    fromDate.setDate(1);
    fromDate.setHours(0, 0, 0, 0);
    return fromDate;
  }

  return null;
};

const mountUsersWithPoints = async (
  rankings: Array<{ userId: string; _sum: { pointsChange: number | null } }>,
) => {
  const userIds = rankings.map((r) => r.userId);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      avatarColor: true,
      avatarUrl: true,
      streakCurrent: true,
      streakBest: true,
      tier: { select: { name: true, icon: true } },
    },
  });

  const usersById = new Map(users.map((user) => [user.id, user]));

  return rankings
    .map((rank) => {
      const user = usersById.get(rank.userId);
      if (!user) return null;

      const points = rank._sum.pointsChange || 0;
      return {
        ...user,
        points,
        connectaPoints: points,
      };
    })
    .filter(Boolean);
};

const getActivityLogLeaderboard = async (
  period: string,
  page: number,
  limit: number,
  projectIds: string[] = [],
) => {
  const skip = (page - 1) * limit;
  const fromDate = getFromDateByPeriod(period);

  const baseWhere = {
    ...(fromDate ? { createdAt: { gte: fromDate } } : {}),
    pointsChange: { not: null },
    ...(projectIds.length > 0 ? { projectId: { in: projectIds } } : {}),
  };

  const rankings = await prisma.activityLog.groupBy({
    by: ['userId'],
    where: baseWhere,
    _sum: {
      pointsChange: true,
    },
    orderBy: [{ _sum: { pointsChange: 'desc' } }, { userId: 'asc' }],
    take: limit,
    skip,
  });

  const totalUsers = (
    await prisma.activityLog.groupBy({
      by: ['userId'],
      where: baseWhere,
    })
  ).length;

  const normalizedRankings = rankings.map((rank) => ({
    userId: rank.userId,
    _sum: { pointsChange: rank._sum.pointsChange },
  }));

  const users = await mountUsersWithPoints(normalizedRankings);
  return { users, total: totalUsers, page, limit };
};

const getProjectsLeaderboardFromTasks = async (projectIds: string[], period: string, page: number, limit: number) => {
  const fromDate = getFromDateByPeriod(period);
  const skip = (page - 1) * limit;

  const tasks = await prisma.task.findMany({
    where: {
      projectId: { in: projectIds },
      OR: fromDate
        ? [
            { createdAt: { gte: fromDate } },
            { completedAt: { gte: fromDate } },
          ]
        : undefined,
    },
    select: {
      id: true,
      projectId: true,
      createdById: true,
      createdAt: true,
      completedAt: true,
      assignedToId: true,
      project: {
        select: {
          pointsPerOpenTask: true,
          pointsPerCompletedTask: true,
        },
      },
      assignees: {
        select: {
          userId: true,
        },
      },
    },
  });

  const pointsByUser = new Map<string, number>();

  for (const task of tasks) {
    const creationPoints = task.project?.pointsPerOpenTask ?? 50;
    const completionPoints = task.project?.pointsPerCompletedTask ?? 100;

    const shouldCountCreation = !fromDate || task.createdAt >= fromDate;
    if (shouldCountCreation && creationPoints > 0) {
      pointsByUser.set(task.createdById, (pointsByUser.get(task.createdById) || 0) + creationPoints);
    }

    const shouldCountCompletion = Boolean(task.completedAt && (!fromDate || task.completedAt >= fromDate));
    if (shouldCountCompletion && completionPoints > 0) {
      const assignees = new Set<string>();

      if (task.assignedToId) {
        assignees.add(task.assignedToId);
      }

      task.assignees.forEach((assignee) => assignees.add(assignee.userId));

      for (const assigneeId of assignees) {
        pointsByUser.set(assigneeId, (pointsByUser.get(assigneeId) || 0) + completionPoints);
      }
    }
  }

  const sortedEntries = [...pointsByUser.entries()]
    .map(([userId, points]) => ({ userId, points }))
    .sort((a, b) => b.points - a.points || a.userId.localeCompare(b.userId));

  const paged = sortedEntries.slice(skip, skip + limit);
  const rankings = paged.map((entry) => ({
    userId: entry.userId,
    _sum: { pointsChange: entry.points },
  }));

  const users = await mountUsersWithPoints(rankings);

  return {
    users,
    total: sortedEntries.length,
    page,
    limit,
  };
};

export const getLeaderboard = async (
  period: string = 'all',
  page: number,
  limit: number,
  projectIds: string[] = [],
) => {
  if (projectIds.length > 0) {
    return getProjectsLeaderboardFromTasks(projectIds, period, page, limit);
  }

  if (period === 'all') {
    return getGlobalLeaderboard(page, limit);
  }

  return getActivityLogLeaderboard(period, page, limit);
};

const getGlobalLeaderboard = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const users = await prisma.user.findMany({
    skip,
    take: limit,
    orderBy: [{ connectaPoints: 'desc' }, { name: 'asc' }],
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

  const members = project.members.map((tm) => tm.user);
  const totalMembers = await prisma.projectMember.count({ where: { projectId, user: { isActive: true } } });

  return { projectName: project.title, members, total: totalMembers, page, limit };
};
