import { Prisma, Task, TaskStatus, Role, ActivityType } from '@prisma/client';
import { createTask, findTaskById, updateTask, deleteTask, findTasksByProjectId, findUserTasks } from '../repositories/task.repository';
import { findUserById } from '../repositories/user.repository';
import { findProjectById, isUserProjectMember } from '../repositories/project.repository';
import { createActivityLog } from '../repositories/activityLog.repository';
import { CreateTaskInput, UpdateTaskInput, MoveTaskInput } from '../schemas/task.schema';
import { addPointsForTaskCompletion, updateStreakForUser } from './gamification.service';
import prisma from '../utils/prisma';

const DIFFICULTY_POINTS_MULTIPLIER = 5;
const POINTS_PER_MINUTE = 0.5;

const calculateTaskPoints = (difficulty: number, estimatedTimeMinutes?: number | null): number => {
  let totalPoints = difficulty * DIFFICULTY_POINTS_MULTIPLIER;
  if (estimatedTimeMinutes && estimatedTimeMinutes > 0) {
    totalPoints += Math.floor(estimatedTimeMinutes * POINTS_PER_MINUTE);
  }
  return totalPoints;
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

  const pointsReward = calculateTaskPoints(data.difficulty, data.estimatedTimeMinutes);

  return prisma.$transaction(async (tx) => {
    const task = await createTask({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      estimatedTimeMinutes: data.estimatedTimeMinutes,
      pointsReward,
      dueDate: data.dueDate,
      tags: data.tags,
      isExternalDemand,
      createdBy: { connect: { id: createdById } },
      project: { connect: { id: data.projectId } },
      assignedTo: data.assignedToId ? { connect: { id: data.assignedToId } } : undefined,
      requiredTier: data.requiredTierId ? { connect: { id: data.requiredTierId } } : undefined,
    });

    await createActivityLog({
      user: { connect: { id: createdById } },
      type: ActivityType.TASK_CREATED,
      description: `Created task "${task.title}" for project "${project.title}"${isExternalDemand ? ' (External Demand)' : ''}.`,
    }, tx);

    return task;
  });
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

  const isAuthorized = requestingUserRole === Role.ADMIN || project.leaderId === requestingUserId || task.assignedToId === requestingUserId;
  if (!isAuthorized) {
    throw { statusCode: 403, message: 'You are not authorized to update this task.' };
  }

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

  return prisma.$transaction(async (tx) => {
    const updateData: Prisma.TaskUpdateInput = { ...data };

    if (data.difficulty !== undefined || data.estimatedTimeMinutes !== undefined) {
      const newDifficulty = data.difficulty !== undefined ? data.difficulty : task.difficulty;
      const newEstimatedTime = data.estimatedTimeMinutes !== undefined ? data.estimatedTimeMinutes : task.estimatedTimeMinutes;
      updateData.pointsReward = calculateTaskPoints(newDifficulty, newEstimatedTime);
    }

    const updatedTask = await updateTask(id, updateData, tx);

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

  if (!isAdmin && !isProjectLeader && !isAssignedUser) {
    throw { statusCode: 403, message: 'You are not authorized to move this task.' };
  }

  if (data.newStatus === TaskStatus.done && !isAdmin && !isProjectLeader) {
    throw { statusCode: 403, message: 'Only project leaders or administrators can mark tasks as DONE.' };
  }

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

  const isAuthorized = requestingUserRole === Role.ADMIN || project.leaderId === requestingUserId;
  if (!isAuthorized) {
    throw { statusCode: 403, message: 'You are not authorized to delete this task.' };
  }

  return prisma.$transaction(async (tx) => {
    await deleteTask(id);
    await createActivityLog({
      user: { connect: { id: requestingUserId } },
      type: ActivityType.TASK_DELETED,
      description: `Deleted task "${task.title}".`,
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
  return findUserTasks(userId, undefined);
};