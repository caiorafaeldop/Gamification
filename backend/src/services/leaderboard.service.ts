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

export const getLeaderboard = async (
  period: string = 'all',
  page: number,
  limit: number,
  projectIds: string[] = []
) => {
  if (projectIds.length > 0) {
    return getProjectsLeaderboard(projectIds, period, page, limit);
  }

  if (period === 'all') {
    return getGlobalLeaderboard(page, limit);
  }

  const skip = (page - 1) * limit;
  const fromDate = getFromDateByPeriod(period);

  const rankings = await prisma.activityLog.groupBy({
    by: ['userId'],
    where: {
      ...(fromDate ? { createdAt: { gte: fromDate } } : {}),
      pointsChange: { not: null },
    },
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
      where: {
        ...(fromDate ? { createdAt: { gte: fromDate } } : {}),
        pointsChange: { not: null },
      },
    })
  ).length;

  const userIds = rankings.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
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
  const resultUsers = rankings
    .map((rank) => {
      const user = usersById.get(rank.userId);
      if (!user) return null;
      const points = Math.max(0, rank._sum.pointsChange || 0);
      return {
        ...user,
        points,
        connectaPoints: points,
      };
    })
    .filter(Boolean);

  return { users: resultUsers, total: totalUsers, page, limit };
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

const getProjectsLeaderboard = async (projectIds: string[], period: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const fromDate = getFromDateByPeriod(period);

  const rankings = await prisma.task.groupBy({
    by: ['assignedToId'],
    where: {
      projectId: { in: projectIds },
      assignedToId: { not: null },
      completedAt: {
        not: null,
        ...(fromDate ? { gte: fromDate } : {}),
      },
    },
    _sum: {
      pointsReward: true,
    },
    orderBy: [{ _sum: { pointsReward: 'desc' } }, { assignedToId: 'asc' }],
    take: limit,
    skip,
  });

  const totalUsers = (
    await prisma.task.groupBy({
      by: ['assignedToId'],
      where: {
        projectId: { in: projectIds },
        assignedToId: { not: null },
        completedAt: {
          not: null,
          ...(fromDate ? { gte: fromDate } : {}),
        },
      },
    })
  ).length;

  const userIds = rankings
    .map((rank) => rank.assignedToId)
    .filter((id): id is string => Boolean(id));

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

  const resultUsers = rankings
    .map((rank) => {
      if (!rank.assignedToId) return null;
      const user = usersById.get(rank.assignedToId);
      if (!user) return null;
      const points = Math.max(0, rank._sum.pointsReward || 0);
      return {
        ...user,
        points,
        connectaPoints: points,
      };
    })
    .filter(Boolean);

  return { users: resultUsers, total: totalUsers, page, limit };
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
