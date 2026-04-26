import prisma from '../utils/prisma';

const ROW_LIMIT = 20;
const TRENDING_WINDOW_DAYS = 7;
const RECENT_WINDOW_DAYS = 14;

const projectInclude = {
  members: { select: { userId: true } },
  leader: { select: { id: true, name: true, avatarUrl: true, avatarColor: true } },
  Group: { select: { id: true, name: true, color: true, logoUrl: true } },
  _count: { select: { members: true, tasks: true, likes: true } },
};

const baseSelectableProject = (extra: Record<string, any> = {}) => ({
  status: { not: 'archived' as const },
  ...extra,
});

const visibleToOutsider = { in: ['PUBLIC_VIEW', 'PUBLIC_LIKE', 'PUBLIC_OPEN'] as const };

export const getCatalogForUser = async (userId: string) => {
  const userGroupMemberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true },
  });
  const userGroupIds = userGroupMemberships.map((m) => m.groupId);

  const userLikes = await prisma.projectLike.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const likedSet = new Set(userLikes.map((l) => l.projectId));

  const trendingSince = new Date(Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const recentSince = new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [
    yoursRaw,
    recentRaw,
    openRaw,
    trendingAgg,
    fromYourGroupsRaw,
    allGroups,
    distinctCategories,
  ] = await Promise.all([
    // 1. Seus projetos (líder ou membro)
    prisma.project.findMany({
      where: baseSelectableProject({
        OR: [{ leaderId: userId }, { members: { some: { userId } } }],
      }),
      include: projectInclude,
      orderBy: { updatedAt: 'desc' },
      take: ROW_LIMIT,
    }),

    // 3. Recém-lançados
    prisma.project.findMany({
      where: baseSelectableProject({
        visibility: visibleToOutsider,
        createdAt: { gte: recentSince },
      }),
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
      take: ROW_LIMIT,
    }),

    // 4. Aceitando membros
    prisma.project.findMany({
      where: baseSelectableProject({
        visibility: visibleToOutsider,
        isJoiningOpen: true,
      }),
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
      take: ROW_LIMIT,
    }),

    // 2. Em alta (likes nos últimos 7 dias)
    prisma.projectLike.groupBy({
      by: ['projectId'],
      where: { createdAt: { gte: trendingSince } },
      _count: { projectId: true },
      orderBy: { _count: { projectId: 'desc' } },
      take: ROW_LIMIT,
    }),

    // 7. Do seu grupo (projetos do meu grupo onde não sou membro)
    userGroupIds.length > 0
      ? prisma.project.findMany({
          where: baseSelectableProject({
            groupId: { in: userGroupIds },
            leaderId: { not: userId },
            members: { none: { userId } },
          }),
          include: projectInclude,
          orderBy: { createdAt: 'desc' },
          take: ROW_LIMIT,
        })
      : Promise.resolve([] as any[]),

    // 5. Por grupo: pega lista de grupos com projetos visíveis
    prisma.group.findMany({
      where: { Project: { some: baseSelectableProject({ visibility: visibleToOutsider }) } },
      select: { id: true, name: true, color: true, logoUrl: true },
      orderBy: { name: 'asc' },
    }),

    // 6. Por categoria: lista de categorias distintas
    prisma.project.findMany({
      where: baseSelectableProject({ visibility: visibleToOutsider, category: { not: null } }),
      select: { category: true },
      distinct: ['category'],
    }),
  ]);

  // Hidrata "Em alta" com os projetos completos (groupBy retorna só ids/contagens)
  const trendingIds = trendingAgg.map((t) => t.projectId);
  const trendingProjects = trendingIds.length
    ? await prisma.project.findMany({
        where: baseSelectableProject({
          id: { in: trendingIds },
          visibility: visibleToOutsider,
        }),
        include: projectInclude,
      })
    : [];
  // mantém ordem do groupBy (mais Likes primeiro)
  const trendingMap = new Map(trendingProjects.map((p) => [p.id, p]));
  const trending = trendingIds
    .map((id) => trendingMap.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // Por grupo: 1 query paralela por grupo
  const byGroup = await Promise.all(
    allGroups.map(async (g) => ({
      group: g,
      projects: await prisma.project.findMany({
        where: baseSelectableProject({
          groupId: g.id,
          visibility: visibleToOutsider,
        }),
        include: projectInclude,
        orderBy: { likeCount: 'desc' },
        take: ROW_LIMIT,
      }),
    })),
  );

  // Por categoria: idem
  const categories = distinctCategories
    .map((c) => c.category)
    .filter((c): c is string => Boolean(c));
  const byCategory = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      projects: await prisma.project.findMany({
        where: baseSelectableProject({
          category: cat,
          visibility: visibleToOutsider,
        }),
        include: projectInclude,
        orderBy: { likeCount: 'desc' },
        take: ROW_LIMIT,
      }),
    })),
  );

  const decorate = (p: any) => ({ ...p, liked: likedSet.has(p.id) });
  const decorateList = (list: any[]) => list.map(decorate);

  return {
    yours: decorateList(yoursRaw),
    trending: decorateList(trending),
    recent: decorateList(recentRaw),
    openForJoining: decorateList(openRaw),
    byGroup: byGroup
      .filter((g) => g.projects.length > 0)
      .map((g) => ({ group: g.group, projects: decorateList(g.projects) })),
    byCategory: byCategory
      .filter((c) => c.projects.length > 0)
      .map((c) => ({ category: c.category, projects: decorateList(c.projects) })),
    fromYourGroups: decorateList(fromYourGroupsRaw),
  };
};
