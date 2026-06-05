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

export const getCatalogForUser = async (userId?: string) => {
  const userGroupMemberships = userId
    ? await prisma.groupMember.findMany({
        where: { userId },
        select: { groupId: true },
      })
    : [];
  const userGroupIds = userGroupMemberships.map((m) => m.groupId);

  const userLikes = userId
    ? await prisma.projectLike.findMany({
        where: { userId },
        select: { projectId: true },
      })
    : [];
  const likedSet = new Set(userLikes.map((l) => l.projectId));

  const trendingSince = new Date(Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const recentSince = new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [
    yoursRaw,
    recentRaw,
    openRaw,
    trendingAgg,
    mostActiveAgg,
    fromYourGroupsRaw,
    allGroups,
    distinctCategories,
  ] = await Promise.all([
    // 1. Seus projetos (líder ou membro) — vazio para guest
    userId
      ? prisma.project.findMany({
          where: baseSelectableProject({
            OR: [{ leaderId: userId }, { members: { some: { userId } } }],
          }),
          include: projectInclude,
          orderBy: { updatedAt: 'desc' },
          take: ROW_LIMIT,
        })
      : Promise.resolve([] as any[]),

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

    // 2b. Mais ativos: soma de pontos positivos distribuídos via ActivityLog
    prisma.activityLog.groupBy({
      by: ['projectId'],
      where: { projectId: { not: null }, pointsChange: { gt: 0 } },
      _sum: { pointsChange: true },
      orderBy: { _sum: { pointsChange: 'desc' } },
      take: ROW_LIMIT,
    }),

    // 7. Do seu grupo (projetos do meu grupo onde não sou membro) — vazio para guest
    userId && userGroupIds.length > 0
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

  // Hidrata "Em alta" e "Mais ativos" em paralelo, além de carregar todos os projetos de grupos e categorias em lote (evitando queries N+1)
  const trendingIds = trendingAgg.map((t) => t.projectId);
  const mostActiveIds = mostActiveAgg
    .map((a) => a.projectId)
    .filter((id): id is string => Boolean(id));

  const [trendingProjects, mostActiveProjects, allGroupProjects, allCategoryProjects] = await Promise.all([
    // Hidratação Trending
    trendingIds.length
      ? prisma.project.findMany({
          where: baseSelectableProject({
            id: { in: trendingIds },
            visibility: visibleToOutsider,
          }),
          include: projectInclude,
        })
      : Promise.resolve([]),

    // Hidratação Mais ativos
    mostActiveIds.length
      ? prisma.project.findMany({
          where: baseSelectableProject({
            id: { in: mostActiveIds },
            visibility: visibleToOutsider,
          }),
          include: projectInclude,
        })
      : Promise.resolve([]),

    // Projetos agrupados por Grupo (Batch Query)
    prisma.project.findMany({
      where: baseSelectableProject({
        groupId: { not: null },
        visibility: visibleToOutsider,
      }),
      include: projectInclude,
      orderBy: { likeCount: 'desc' },
    }),

    // Projetos agrupados por Categoria (Batch Query)
    prisma.project.findMany({
      where: baseSelectableProject({
        category: { not: null },
        visibility: visibleToOutsider,
      }),
      include: projectInclude,
      orderBy: { likeCount: 'desc' },
    }),
  ]);

  // Mantém a ordem do groupBy original para Trending (mais likes primeiro)
  const trendingMap = new Map(trendingProjects.map((p) => [p.id, p]));
  const trending = trendingIds
    .map((id) => trendingMap.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // Mantém a ordem do groupBy original para Mais ativos
  const mostActiveMap = new Map(mostActiveProjects.map((p) => [p.id, p]));
  const mostActive = mostActiveIds
    .map((id) => mostActiveMap.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // Agrupamento na memória por Grupo (limitando a ROW_LIMIT por grupo)
  const groupProjectsMap = new Map<string, any[]>();
  for (const proj of allGroupProjects) {
    if (proj.groupId) {
      if (!groupProjectsMap.has(proj.groupId)) {
        groupProjectsMap.set(proj.groupId, []);
      }
      const list = groupProjectsMap.get(proj.groupId)!;
      if (list.length < ROW_LIMIT) {
        list.push(proj);
      }
    }
  }

  // Agrupamento na memória por Categoria (limitando a ROW_LIMIT por categoria)
  const categoryProjectsMap = new Map<string, any[]>();
  for (const proj of allCategoryProjects) {
    if (proj.category) {
      if (!categoryProjectsMap.has(proj.category)) {
        categoryProjectsMap.set(proj.category, []);
      }
      const list = categoryProjectsMap.get(proj.category)!;
      if (list.length < ROW_LIMIT) {
        list.push(proj);
      }
    }
  }

  const byGroup = allGroups
    .map((g) => ({
      group: g,
      projects: groupProjectsMap.get(g.id) || [],
    }))
    .filter((g) => g.projects.length > 0);

  const categories = distinctCategories
    .map((c) => c.category)
    .filter((c): c is string => Boolean(c));

  const byCategory = categories
    .map((cat) => ({
      category: cat,
      projects: categoryProjectsMap.get(cat) || [],
    }))
    .filter((c) => c.projects.length > 0);

  const decorate = (p: any) => ({ ...p, liked: likedSet.has(p.id) });
  const decorateList = (list: any[]) => list.map(decorate);

  return {
    yours: decorateList(yoursRaw),
    trending: decorateList(trending),
    mostActive: decorateList(mostActive),
    recent: decorateList(recentRaw),
    openForJoining: decorateList(openRaw),
    byGroup: byGroup.map((g) => ({
      group: g.group,
      projects: decorateList(g.projects),
    })),
    byCategory: byCategory.map((c) => ({
      category: c.category,
      projects: decorateList(c.projects),
    })),
    fromYourGroups: decorateList(fromYourGroupsRaw),
  };
};
