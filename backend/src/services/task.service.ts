import { Prisma, Task, TaskStatus, Role, ActivityType, AssigneeType } from '@prisma/client';
import { createTask, findTaskById, updateTask, deleteTask, findTasksByProjectId, findUserTasks, syncTaskAssignees } from '../repositories/task.repository';
import { findUserById } from '../repositories/user.repository';
import { findProjectById, isUserProjectMember } from '../repositories/project.repository';
import { createActivityLog } from '../repositories/activityLog.repository';
import { CreateTaskInput, UpdateTaskInput, MoveTaskInput } from '../schemas/task.schema';
import { addPointsForTaskCompletion, updateStreakForUser, removePointsForTaskUncompletion, removePointsForTaskDeletion } from './gamification.service';
import { checkAndAwardAchievements } from './achievement.service';
import prisma from '../utils/prisma';

const calculateTaskPoints = (difficulty: number): number => {
  if (difficulty <= 1) return 50;
  if (difficulty === 2) return 100;
  return 200; // Dificuldade 3 ou superior
};

export const createNewTask = async (data: CreateTaskInput, createdById: string) => {
  const project = await findProjectById(data.projectId);
  if (!project) {
    throw { statusCode: 404, message: 'Project not found.' };
  }

  const creator = await findUserById(createdById);
  if (!creator) {
    throw { statusCode: 404, message: 'Creator user not found.' };
  }

  const isMemberOfProject = await isUserProjectMember(data.projectId, createdById);
  const isExternalDemand = !isMemberOfProject;

  if (data.assignedToId) {
    const assignedToUser = await findUserById(data.assignedToId);
    if (!assignedToUser) {
      throw { statusCode: 404, message: 'Assigned user not found.' };
    }
    const isAssignedMember = await isUserProjectMember(data.projectId, data.assignedToId);
    if (!isAssignedMember) {
      throw { statusCode: 400, message: 'Assigned user is not a member of this project.' };
    }
  }

  const difficulty = data.difficulty || 2;
  const pointsReward = calculateTaskPoints(difficulty);

  const taskResult = await prisma.$transaction(async (tx) => {
    const task = await createTask({
      title: data.title,
      description: data.description,
      difficulty,
      estimatedTimeMinutes: data.estimatedTimeMinutes,
      pointsReward,
      dueDate: data.dueDate,
      tags: data.tags,
      isExternalDemand,
      // Novos campos estilo Trello
      startDate: data.startDate,
      durationMinutes: data.durationMinutes,
      attachmentUrl: data.attachmentUrl || null,
      createdBy: { connect: { id: createdById } },
      project: { connect: { id: data.projectId } },
      assignedTo: data.assignedToId ? { connect: { id: data.assignedToId } } : undefined,
      KanbanColumn: data.columnId ? ({ connect: { id: data.columnId } } as any) : undefined,
      requiredTier: data.requiredTierId ? { connect: { id: data.requiredTierId } } : undefined,
    } as any, tx);

    // Sincronizar múltiplos assignees se fornecidos, adicionando o criador
    let assigneesToSync = data.assignees || [];
    
    // Verificar se o criador já está na lista
    const isCreatorInList = assigneesToSync.some(a => a.userId === createdById);
    
    if (!isCreatorInList) {
      assigneesToSync = [...assigneesToSync, { userId: createdById, type: AssigneeType.CREATOR }];
    }

    if (assigneesToSync.length > 0) {
      await syncTaskAssignees(task.id, assigneesToSync, tx);
    }

    await createActivityLog({
      user: { connect: { id: createdById } },
      type: ActivityType.TASK_CREATED,
      description: `Created task "${task.title}" for project "${project.title}"${isExternalDemand ? ' (External Demand)' : ''}.`,
    }, tx);

    // Dar pontos por CRIAR a task (pointsPerOpenTask)
    const pointsForCreation = (project as any).pointsPerOpenTask ?? 50;
    if (pointsForCreation > 0) {
      await addPointsForTaskCompletion(createdById, pointsForCreation, task.id, tx);
      console.log(`[POINTS] Added ${pointsForCreation} points to user ${createdById} for CREATING task`);
    }

    return task;
  });

  console.log(`[TRIGGER] Task created, checking achievements for ${createdById} (Async)`);
  // Run outside the main transaction to avoid timeouts
  checkAndAwardAchievements(createdById).catch(err => console.error("Achievement check failed:", err));

  return taskResult;
};

export const getTaskDetails = async (id: string) => {
  const task = await findTaskById(id);
  if (!task) {
    throw { statusCode: 404, message: 'Task not found.' };
  }
  return task;
};

export const updateTaskDetails = async (id: string, data: UpdateTaskInput, requestingUserId: string, requestingUserRole: Role) => {
  const task = await findTaskById(id);
  if (!task) {
    throw { statusCode: 404, message: 'Task not found.' };
  }

  const project = await findProjectById(task.projectId);
  if (!project) {
    throw { statusCode: 404, message: 'Task\'s project not found.' };
  }

  /* Permissão removida conforme solicitação: qualquer usuário autenticado pode editar */
  // const isMember = await isUserProjectMember(task.projectId, requestingUserId);
  // const isAuthorized = requestingUserRole === Role.ADMIN || project.leaderId === requestingUserId || task.assignedToId === requestingUserId || isMember;
  // if (!isAuthorized) {
  //   throw { statusCode: 403, message: 'You are not authorized to update this task.' };
  // }

  if (data.assignedToId && data.assignedToId !== task.assignedToId) {
    const assignedToUser = await findUserById(data.assignedToId);
    if (!assignedToUser) {
      throw { statusCode: 404, message: 'New assigned user not found.' };
    }
    const isMember = await isUserProjectMember(task.projectId, data.assignedToId);
    if (!isMember) {
      throw { statusCode: 400, message: 'New assigned user is not a member of this project.' };
    }
  }

  // Extrair assignees e assigneeIds do data antes de passar para o Prisma
  const { assignees, assigneeIds, ...taskData } = data as any;

  // Normalizar assignees
  let assigneesToProcess = assignees;
  if (!assigneesToProcess && assigneeIds) {
    assigneesToProcess = assigneeIds.map((userId: string) => ({ userId, type: AssigneeType.IMPLEMENTER }));
  }

  return prisma.$transaction(async (tx) => {
    const updateData: any = { ...taskData };

    // Limpar attachmentUrl se vier vazio
    if (updateData.attachmentUrl === '') {
      updateData.attachmentUrl = null;
    }

    if (data.difficulty !== undefined) {
      updateData.pointsReward = calculateTaskPoints(data.difficulty);
    }

    // Tratar columnId para conexão
    if (taskData.columnId !== undefined) {
      if (taskData.columnId) {
        updateData.KanbanColumn = { connect: { id: taskData.columnId } };
      } else {
        updateData.KanbanColumn = { disconnect: true };
      }
      delete updateData.columnId;
    }

    const updatedTask = await updateTask(id, updateData, tx);

    // Sincronizar múltiplos assignees se fornecidos
    if (assigneesToProcess !== undefined) {
      // PONTUAÇÃO RETROATIVA: Se a task está concluída, dar/remover pontos
      const isCompleted = task.completedAt !== null;
      
      if (isCompleted) {
        const pointsForCompletion = (project as any).pointsPerCompletedTask ?? 100;
        const currentAssigneeIds = (task as any).assignees?.map((a: any) => a.user?.id || a.userId) || [];
        const newAssigneeIds = assigneesToProcess.map((a: any) => a.userId) as string[];
        
        // Quem foi ADICIONADO ganha pontos
        const addedAssignees = newAssigneeIds.filter((id: string) => !currentAssigneeIds.includes(id));
        for (const userId of addedAssignees) {
          await addPointsForTaskCompletion(userId, pointsForCompletion, task.id, tx);
          console.log(`[RETROACTIVE] Added ${pointsForCompletion} points to user ${userId} for being added to completed task`);
        }
        
        // Quem foi REMOVIDO perde pontos
        const removedAssignees = currentAssigneeIds.filter((id: string) => !newAssigneeIds.includes(id));
        for (const userId of removedAssignees) {
          await removePointsForTaskUncompletion(userId, pointsForCompletion, task.id, tx);
          console.log(`[RETROACTIVE] Removed ${pointsForCompletion} points from user ${userId} for being removed from completed task`);
        }
      }
      
      await syncTaskAssignees(id, assigneesToProcess || [], tx);
    }

    if (data.assignedToId && data.assignedToId !== task.assignedToId) {
      const assignedUser = data.assignedToId ? await findUserById(data.assignedToId) : null;
      await createActivityLog({
        user: { connect: { id: requestingUserId } },
        type: ActivityType.TASK_ASSIGNED,
        description: `Assigned task "${updatedTask.title}" to ${assignedUser?.name || 'unassigned'}.`,
      }, tx);
    }

    return updatedTask;
  });
};

export const moveTaskStatus = async (id: string, data: MoveTaskInput, requestingUserId: string, requestingUserRole: Role) => {
  const task = await findTaskById(id);
  if (!task) {
    throw { statusCode: 404, message: 'Task not found.' };
  }

  const project = await findProjectById(task.projectId);
  if (!project) {
    throw { statusCode: 404, message: 'Task\'s project not found.' };
  }

  const isProjectLeader = project.leaderId === requestingUserId;
  const isAdmin = requestingUserRole === Role.ADMIN;
  const isAssignedUser = task.assignedToId === requestingUserId;

  const isMember = await isUserProjectMember(task.projectId, requestingUserId);

  /* Permissão removida conforme solicitação: qualquer usuário autenticado pode mover */
  // if (!isAdmin && !isProjectLeader && !isAssignedUser && !isMember) {
  //   throw { statusCode: 403, message: 'You are not authorized to move this task.' };
  // }

  // if (data.newStatus === TaskStatus.done && !isAdmin && !isProjectLeader && !isMember) {
  //   throw { statusCode: 403, message: 'Only project members, leaders or administrators can mark tasks as DONE.' };
  // }

  if (task.status === data.newStatus) {
    return task;
  }

  return prisma.$transaction(async (tx) => {
    const updateData: Prisma.TaskUpdateInput = { status: data.newStatus };

    if (data.newStatus === TaskStatus.done && !task.completedAt) {
      updateData.completedAt = new Date();
      if (task.assignedToId) {
        await addPointsForTaskCompletion(task.assignedToId, task.pointsReward, task.id, tx);
        await updateStreakForUser(task.assignedToId, tx);
      }
    } else if (data.newStatus !== TaskStatus.done && task.completedAt) {
      updateData.completedAt = null;
    }

    const updatedTask = await updateTask(id, updateData, tx);

    await createActivityLog({
      user: { connect: { id: requestingUserId } },
      type: ActivityType.TASK_STATUS_CHANGED,
      description: `Moved task "${updatedTask.title}" from ${task.status} to ${updatedTask.status}.`,
    }, tx);

    return updatedTask;
  });
};

export const deleteTaskById = async (id: string, requestingUserId: string, requestingUserRole: Role) => {
  const task = await findTaskById(id);
  if (!task) {
    throw { statusCode: 404, message: 'Task not found.' };
  }

  const project = await findProjectById(task.projectId);
  if (!project) {
    throw { statusCode: 404, message: 'Task\'s project not found.' };
  }

  const isMember = await isUserProjectMember(task.projectId, requestingUserId);
  console.log(`[DELETE TASK CHECK] Leader: ${project.leaderId}, Requester: ${requestingUserId}, IsMember: ${isMember}, Creator: ${task.createdById}`);

  const isCreator = task.createdById === requestingUserId;
  const isAuthorized = requestingUserRole === Role.ADMIN || project.leaderId === requestingUserId || isMember || isCreator;
  
  if (!isAuthorized) {
    throw { statusCode: 403, message: 'You are not authorized to delete this task.' };
  }

  return prisma.$transaction(async (tx) => {
    // 1. Remover pontos de criação do criador
    const pointsForCreation = (project as any).pointsPerOpenTask ?? 50;
    if (pointsForCreation > 0) {
      await removePointsForTaskDeletion(task.createdById, pointsForCreation, task.id, tx);
      console.log(`[DELETE TASK] Removed ${pointsForCreation} points from creator ${task.createdById}`);
    }

    // 2. Se a task estava concluída, remover pontos de conclusão de todos os assignees
    if (task.status === TaskStatus.done) {
      const pointsForCompletion = (project as any).pointsPerCompletedTask ?? 100;
      
      // AssignedToId principal
      if (task.assignedToId) {
        await removePointsForTaskUncompletion(task.assignedToId, pointsForCompletion, task.id, tx);
        console.log(`[DELETE TASK] Removed ${pointsForCompletion} completion points from main assignee ${task.assignedToId}`);
      }

      // Múltiplos assignees
      const assignees = (task as any).assignees || [];
      for (const assignment of assignees) {
        const userId = assignment.userId || assignment.user?.id;
        // Evitar remover duas vezes se for o mesmo user
        if (userId && userId !== task.assignedToId) {
          await removePointsForTaskUncompletion(userId, pointsForCompletion, task.id, tx);
          console.log(`[DELETE TASK] Removed ${pointsForCompletion} completion points from secondary assignee ${userId}`);
        }
      }
    }

    await deleteTask(id, tx);
    await createActivityLog({
      user: { connect: { id: requestingUserId } },
      type: ActivityType.TASK_DELETED,
      description: `Deleted task "${task.title}". Points revoked.`,
    }, tx);
    return task;
  });
};

export const getKanbanBoardForProject = async (projectId: string) => {
  const project = await findProjectById(projectId);
  if (!project) {
    throw { statusCode: 404, message: 'Project not found.' };
  }

  const tasks = await findTasksByProjectId(projectId);

  const kanbanBoard: Record<TaskStatus, Task[]> = {
    [TaskStatus.todo]: [],
    [TaskStatus.in_progress]: [],
    [TaskStatus.done]: [],
  };

  tasks.forEach(task => { // Use 'any' or correct type mapping if necessary, but here key matching is safer
    if (kanbanBoard[task.status]) {
      kanbanBoard[task.status].push(task);
    }
  });

  return kanbanBoard;
};

export const getMyNextTasks = async (userId: string) => {
  return findUserTasks(userId, { completedAt: null });
};
