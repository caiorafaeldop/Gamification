import prisma from '../utils/prisma';
import { Prisma, Task, TaskStatus } from '@prisma/client';

export const createTask = async (data: Prisma.TaskCreateInput): Promise<Task> => {
  return prisma.task.create({ data });
};

export const findTaskById = async (id: string): Promise<Task | null> => {
  return prisma.task.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } },
      requiredTier: true,
    },
  });
};

export const updateTask = async (id: string, data: Prisma.TaskUpdateInput, transaction?: Prisma.TransactionClient): Promise<Task> => {
  const client = transaction || prisma;
  return client.task.update({
    where: { id },
    data,
    include: {
      assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, title: true } },
      requiredTier: true,
    },
  });
};

export const deleteTask = async (id: string): Promise<Task> => {
  return prisma.task.delete({ where: { id } });
};

export const findTasksByProjectId = async (projectId: string): Promise<Task[]> => {
  return prisma.task.findMany({
    where: { projectId },
    include: {
      assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true } },
      requiredTier: true,
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const findUserTasks = async (userId: string, status?: TaskStatus): Promise<Task[]> => {
  return prisma.task.findMany({
    where: {
      assignedToId: userId,
      ...(status && { status }),
    },
    include: {
      project: { select: { id: true, title: true } },
      requiredTier: true,
    },
    orderBy: { dueDate: 'asc' },
  });
};