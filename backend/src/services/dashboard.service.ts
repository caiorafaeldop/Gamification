import prisma from '../utils/prisma';
import { TaskStatus, Prisma } from '@prisma/client';

export const getDashboardStats = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tier: true,
      memberOfProjects: {
        include: {
          project: {
            include: {
              tasks: {
                where: { status: TaskStatus.done }
              }
            }
          }
        },
        orderBy: {
          assignedAt: 'desc'
        }
      },
      assignedTasks: {
        where: { status: TaskStatus.in_progress }
      }
    }
  });

  if (!user) throw { statusCode: 404, message: 'User not found' };

  // Calculate some stats
  const totalXP = user.connectaPoints;
  const currentLevel = user.tier.name;
  const nextTier = await prisma.tier.findFirst({
    where: { minPoints: { gt: user.tier.minPoints } },
    orderBy: { minPoints: 'asc' }
  });
  const pointsToNextLevel = nextTier ? nextTier.minPoints - totalXP : 0;

  const activeProjects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId: userId }
      }
    },
    take: 5,
    include: {
      tasks: true,
      leader: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    }
  });

  const recentActivity = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const tierRange = nextTier ? nextTier.minPoints - user.tier.minPoints : 1;
  const progressIntoTier = totalXP - user.tier.minPoints;
  const tierProgress = nextTier ? Math.min(Math.round((progressIntoTier / tierRange) * 100), 100) : 100;

  return {
    user: {
      name: user.name,
      points: totalXP,
      tier: currentLevel,
      nextTierPoints: pointsToNextLevel,
      tierProgress: tierProgress
    },
    activeTaskCount: user.assignedTasks.length,
    projects: activeProjects.map((p) => {
      const project = p as any; // Temporary cast to bypass the inference issue if Prisma types are stale
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        coverUrl: project.coverUrl,
        category: project.category,
        status: project.status,
        color: project.color,
        leader: project.leader,
        progress: project.tasks?.length > 0
          ? (project.tasks.filter((t: any) => t.status === TaskStatus.done).length / project.tasks.length) * 100
          : 0
      };
    }),
    recentActivity
  };
};
