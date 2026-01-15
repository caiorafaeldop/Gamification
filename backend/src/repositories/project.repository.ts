import prisma from '../utils/prisma';
import { Prisma, Project, Role, ProjectMember } from '@prisma/client';

export const findProjectById = async (id: string, transaction?: Prisma.TransactionClient) => {
  const client = transaction || prisma;
  return client.project.findUnique({
    where: { id },
    include: {
      leader: {
        select: { id: true, name: true, email: true, role: true, avatarColor: true, avatarUrl: true }
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, avatarColor: true, avatarUrl: true }
          }
        }
      }
    }
  });
};

export const findProjects = async (params: {
  skip?: number;
  take?: number;
  where?: Prisma.ProjectWhereInput;
  orderBy?: Prisma.ProjectOrderByWithRelationInput;
}, transaction?: Prisma.TransactionClient) => {
  const client = transaction || prisma;
  const { skip, take, where, orderBy } = params;
  return client.project.findMany({
    skip,
    take,
    where,
    orderBy,
    include: {
      leader: { select: { id: true, name: true } },
      members: { select: { userId: true } },
      _count: { select: { members: true, tasks: true } }
    }
  });
};

export const createProject = async (data: Prisma.ProjectCreateInput, transaction?: Prisma.TransactionClient): Promise<Project> => {
  const client = transaction || prisma;
  return client.project.create({ data });
};

export const updateProject = async (id: string, data: Prisma.ProjectUpdateInput, transaction?: Prisma.TransactionClient): Promise<Project> => {
  const client = transaction || prisma;
  return client.project.update({ where: { id }, data });
};

export const deleteProject = async (id: string, transaction?: Prisma.TransactionClient): Promise<Project> => {
  const client = transaction || prisma;
  return client.project.delete({ where: { id } });
};

export const addProjectMember = async (projectId: string, userId: string, transaction?: Prisma.TransactionClient): Promise<ProjectMember> => {
  const client = transaction || prisma;
  return client.projectMember.create({
    data: {
      projectId,
      userId,
    }
  });
};

export const removeProjectMember = async (projectId: string, userId: string, transaction?: Prisma.TransactionClient): Promise<ProjectMember> => {
  const client = transaction || prisma;
  return client.projectMember.delete({
    where: {
      userId_projectId: {
        projectId,
        userId
      }
    }
  });
};

export const isUserProjectMember = async (projectId: string, userId: string, transaction?: Prisma.TransactionClient): Promise<boolean> => {
  const client = transaction || prisma;
  const count = await client.projectMember.count({
    where: { projectId, userId }
  });
  return count > 0;
};