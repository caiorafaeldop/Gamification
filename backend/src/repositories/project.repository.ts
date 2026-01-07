import prisma from '../utils/prisma';
import { Prisma, Project, Role, ProjectMember } from '@prisma/client';

export const findProjectById = async (id: string) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      leader: {
        select: { id: true, name: true, email: true, role: true, avatarColor: true }
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, avatarColor: true }
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
}) => {
  const { skip, take, where, orderBy } = params;
  return prisma.project.findMany({
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

export const createProject = async (data: Prisma.ProjectCreateInput): Promise<Project> => {
  return prisma.project.create({ data });
};

export const updateProject = async (id: string, data: Prisma.ProjectUpdateInput): Promise<Project> => {
  return prisma.project.update({ where: { id }, data });
};

export const deleteProject = async (id: string): Promise<Project> => {
  return prisma.project.delete({ where: { id } });
};

export const addProjectMember = async (projectId: string, userId: string): Promise<ProjectMember> => {
  return prisma.projectMember.create({
    data: {
      projectId,
      userId,
    }
  });
};

export const removeProjectMember = async (projectId: string, userId: string): Promise<ProjectMember> => {
  return prisma.projectMember.delete({
    where: {
      userId_projectId: {
        projectId,
        userId
      }
    }
  });
};

export const isUserProjectMember = async (projectId: string, userId: string): Promise<boolean> => {
  const count = await prisma.projectMember.count({
    where: { projectId, userId }
  });
  return count > 0;
};