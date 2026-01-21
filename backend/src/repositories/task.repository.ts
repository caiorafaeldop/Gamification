import prisma from '../utils/prisma';
import { Prisma, Task, TaskStatus, AssigneeType } from '@prisma/client';

// Include padrão para tasks com assignees
const taskInclude = {
  assignedTo: { select: { id: true, name: true, email: true, avatarUrl: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, title: true } },
  requiredTier: true,
  assignees: {
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { assignedAt: 'asc' as const },
  },
};

export const createTask = async (data: Prisma.TaskCreateInput, transaction?: Prisma.TransactionClient): Promise<Task> => {
  const client = transaction || prisma;
  return client.task.create({ 
    data,
    include: taskInclude,
  });
};

export const findTaskById = async (id: string): Promise<Task | null> => {
  return prisma.task.findUnique({
    where: { id },
    include: taskInclude,
  });
};

export const updateTask = async (id: string, data: any, transaction?: Prisma.TransactionClient): Promise<Task> => {
  const client = transaction || prisma;
  const { assigneeIds, assignees, ...updateData } = data;

  if (assigneeIds || assignees) {
    // Se assigneeIds for passado (array de strings), converte para formato com tipo default
    const assigneesToSync = assignees || (assigneeIds ? assigneeIds.map((userId: string) => ({ userId, type: AssigneeType.IMPLEMENTER })) : []);
    
    // Atualiza a task
    const updatedTask = await client.task.update({
      where: { id },
      data: updateData,
      include: taskInclude,
    });

    // Sincroniza assignees
    await syncTaskAssignees(id, assigneesToSync, client);
    
    // Retorna task atualizada com os novos assignees
    return findTaskById(id) as Promise<Task>;
  }

  return client.task.update({
    where: { id },
    data: updateData,
    include: taskInclude,
  });
};

export const deleteTask = async (id: string, transaction?: Prisma.TransactionClient): Promise<Task> => {
  const client = transaction || prisma;
  return client.task.delete({ where: { id } });
};

export const findTasksByProjectId = async (projectId: string): Promise<Task[]> => {
  return prisma.task.findMany({
    where: { projectId },
    include: {
      assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      requiredTier: true,
      assignees: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { assignedAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const findUserTasks = async (userId: string, status?: TaskStatus): Promise<Task[]> => {
  return prisma.task.findMany({
    where: {
      OR: [
        { assignedToId: userId },
        { assignees: { some: { userId } } },
      ],
      ...(status && { status }),
    },
    include: {
      project: { select: { id: true, title: true } },
      requiredTier: true,
      assignees: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });
};

// Funções para gerenciar múltiplos assignees
export const addTaskAssignee = async (taskId: string, userId: string, type: AssigneeType, transaction?: Prisma.TransactionClient) => {
  const client = transaction || prisma;
  return client.taskAssignee.upsert({
    where: { 
      taskId_userId_type: { taskId, userId, type } 
    },
    create: { taskId, userId, type },
    update: { type },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });
};

export const removeTaskAssignee = async (taskId: string, userId: string, type?: AssigneeType, transaction?: Prisma.TransactionClient) => {
  const client = transaction || prisma;
  
  if (type) {
    return client.taskAssignee.delete({
      where: { 
        taskId_userId_type: { taskId, userId, type } 
      },
    });
  }

  // Se não especificar tipo, remove todos os convites desse usuário na task
  return client.taskAssignee.deleteMany({
    where: { taskId, userId },
  });
};

export const syncTaskAssignees = async (taskId: string, assignees: { userId: string, type: AssigneeType }[], transaction?: Prisma.TransactionClient) => {
  const client = transaction || prisma;
  
  // Remove todos e adiciona os novos
  await client.taskAssignee.deleteMany({ where: { taskId } });
  
  if (assignees.length > 0) {
    await client.taskAssignee.createMany({
      data: assignees.map(({ userId, type }) => ({ taskId, userId, type })),
    });
  }
};
