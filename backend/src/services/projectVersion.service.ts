import { Prisma, ProjectVersionStatus, Role } from '@prisma/client';
import prisma from '../utils/prisma';
import { isUserProjectMember } from '../repositories/project.repository';
import { CreateProjectVersionInput, UpdateProjectVersionInput } from '../schemas/projectVersion.schema';

const ensureProjectAccess = async (
  projectId: string,
  userId: string,
  userRole: Role,
  requireManager = false,
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      leaderId: true,
      visibility: true,
    },
  });

  if (!project) {
    throw { statusCode: 404, message: 'Projeto não encontrado.' };
  }

  const isAdmin = userRole === Role.ADMIN;
  const isLeader = project.leaderId === userId;

  if (requireManager) {
    if (!isAdmin && !isLeader) {
      throw { statusCode: 403, message: 'Apenas o líder do projeto ou um administrador podem gerenciar versões.' };
    }
    return project;
  }

  const isMember = await isUserProjectMember(projectId, userId);
  const isPublic = project.visibility && project.visibility !== 'PRIVATE';

  if (!isAdmin && !isLeader && !isMember && !isPublic) {
    throw { statusCode: 403, message: 'Você não tem acesso às versões deste projeto.' };
  }

  return project;
};

const normalizeVersionData = (data: CreateProjectVersionInput | UpdateProjectVersionInput) => {
  const normalized: Record<string, unknown> = { ...data };

  if (data.status === ProjectVersionStatus.RELEASED && data.releasedAt === undefined) {
    normalized.releasedAt = new Date();
  }

  return normalized;
};

export const listProjectVersions = async (projectId: string, userId: string, userRole: Role) => {
  await ensureProjectAccess(projectId, userId, userRole);

  return prisma.projectVersion.findMany({
    where: { projectId },
    orderBy: [
      { status: 'asc' },
      { dueDate: 'asc' },
      { createdAt: 'asc' },
    ],
    include: {
      _count: { select: { tasks: true } },
      tasks: {
        select: {
          id: true,
          status: true,
          completedAt: true,
        },
      },
    },
  });
};

export const createProjectVersion = async (
  projectId: string,
  data: CreateProjectVersionInput,
  userId: string,
  userRole: Role,
) => {
  await ensureProjectAccess(projectId, userId, userRole, true);

  try {
    return await prisma.projectVersion.create({
      data: {
        ...normalizeVersionData(data),
        projectId,
      } as Prisma.ProjectVersionUncheckedCreateInput,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw { statusCode: 409, message: 'Já existe uma versão com este nome neste projeto.' };
    }
    throw error;
  }
};

export const updateProjectVersion = async (
  projectId: string,
  versionId: string,
  data: UpdateProjectVersionInput,
  userId: string,
  userRole: Role,
) => {
  await ensureProjectAccess(projectId, userId, userRole, true);

  const version = await prisma.projectVersion.findFirst({
    where: { id: versionId, projectId },
  });

  if (!version) {
    throw { statusCode: 404, message: 'Versão não encontrada neste projeto.' };
  }

  try {
    return await prisma.projectVersion.update({
      where: { id: versionId },
      data: normalizeVersionData(data) as Prisma.ProjectVersionUpdateInput,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw { statusCode: 409, message: 'Já existe uma versão com este nome neste projeto.' };
    }
    throw error;
  }
};

export const deleteProjectVersion = async (
  projectId: string,
  versionId: string,
  userId: string,
  userRole: Role,
) => {
  await ensureProjectAccess(projectId, userId, userRole, true);

  const version = await prisma.projectVersion.findFirst({
    where: { id: versionId, projectId },
  });

  if (!version) {
    throw { statusCode: 404, message: 'Versão não encontrada neste projeto.' };
  }

  return prisma.$transaction(async (tx) => {
    await tx.task.updateMany({
      where: { projectId, versionId },
      data: { versionId: null },
    });

    return tx.projectVersion.delete({
      where: { id: versionId },
    });
  });
};
