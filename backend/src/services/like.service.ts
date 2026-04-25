import prisma from '../utils/prisma';

export const toggleProjectLike = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, visibility: true, groupId: true },
  });
  if (!project) {
    throw { statusCode: 404, message: 'Projeto não encontrado.' };
  }

  if (project.visibility !== 'PUBLIC_LIKE') {
    if (project.visibility === 'PRIVATE' && project.groupId) {
      const isGroupMember = await prisma.groupMember.findUnique({
        where: { userId_groupId: { userId, groupId: project.groupId } },
      });
      if (!isGroupMember) {
        throw { statusCode: 403, message: 'Você não pode curtir este projeto.' };
      }
    } else {
      throw { statusCode: 403, message: 'Este projeto não aceita curtidas.' };
    }
  }

  const existing = await prisma.projectLike.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (existing) {
    const result = await prisma.$transaction([
      prisma.projectLike.delete({ where: { userId_projectId: { userId, projectId } } }),
      prisma.project.update({
        where: { id: projectId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      }),
    ]);
    return { liked: false, likeCount: result[1].likeCount };
  }

  const result = await prisma.$transaction([
    prisma.projectLike.create({ data: { userId, projectId } }),
    prisma.project.update({
      where: { id: projectId },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    }),
  ]);
  return { liked: true, likeCount: result[1].likeCount };
};

export const hasUserLikedProject = async (projectId: string, userId: string) => {
  const like = await prisma.projectLike.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  return !!like;
};

export const getProjectsLikedByUser = async (userId: string) => {
  const likes = await prisma.projectLike.findMany({
    where: { userId },
    select: { projectId: true },
  });
  return likes.map((l) => l.projectId);
};
