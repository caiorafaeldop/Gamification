"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyNextTasks = exports.getKanbanBoardForTeam = exports.deleteTaskById = exports.moveTaskStatus = exports.updateTaskDetails = exports.getTaskDetails = exports.createNewTask = void 0;
const client_1 = require("@prisma/client");
const task_repository_1 = require("../repositories/task.repository");
const user_repository_1 = require("../repositories/user.repository");
const team_repository_1 = require("../repositories/team.repository");
const activityLog_repository_1 = require("../repositories/activityLog.repository");
const gamification_service_1 = require("./gamification.service");
const prisma_1 = __importDefault(require("../utils/prisma"));
const createNewTask = async (data, createdById) => {
    const team = await (0, team_repository_1.findTeamById)(data.teamId);
    if (!team) {
        throw { statusCode: 404, message: 'Team not found.' };
    }
    const creator = await (0, user_repository_1.findUserById)(createdById);
    if (!creator) {
        throw { statusCode: 404, message: 'Creator user not found.' };
    }
    // Determine if it's an external demand
    const isMemberOfTeam = await (0, team_repository_1.isUserTeamMember)(data.teamId, createdById);
    const isExternalDemand = !isMemberOfTeam;
    if (data.assignedToId) {
        const assignedToUser = await (0, user_repository_1.findUserById)(data.assignedToId);
        if (!assignedToUser) {
            throw { statusCode: 404, message: 'Assigned user not found.' };
        }
        const isAssignedMember = await (0, team_repository_1.isUserTeamMember)(data.teamId, data.assignedToId);
        if (!isAssignedMember) {
            throw { statusCode: 400, message: 'Assigned user is not a member of this team.' };
        }
    }
    const pointsReward = getPointsForDifficulty(data.difficulty);
    return prisma_1.default.$transaction(async (tx) => {
        const task = await (0, task_repository_1.createTask)({
            ...data,
            pointsReward,
            createdBy: { connect: { id: createdById } },
            team: { connect: { id: data.teamId } },
            assignedTo: data.assignedToId ? { connect: { id: data.assignedToId } } : undefined,
            requiredTier: data.requiredTierId ? { connect: { id: data.requiredTierId } } : undefined,
            isExternalDemand: isExternalDemand, // Definindo o campo de demanda externa
        });
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: createdById } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.TASK_CREATED,
            description: `Created task "${task.title}" for team "${team.name}"${isExternalDemand ? ' (External Demand)' : ''}.`,
        }, tx);
        return task;
    });
};
exports.createNewTask = createNewTask;
const getTaskDetails = async (id) => {
    const task = await (0, task_repository_1.findTaskById)(id);
    if (!task) {
        throw { statusCode: 404, message: 'Task not found.' };
    }
    return task;
};
exports.getTaskDetails = getTaskDetails;
const updateTaskDetails = async (id, data, requestingUserId, requestingUserRole) => {
    const task = await (0, task_repository_1.findTaskById)(id);
    if (!task) {
        throw { statusCode: 404, message: 'Task not found.' };
    }
    const team = await (0, team_repository_1.findTeamById)(task.teamId);
    if (!team) {
        throw { statusCode: 404, message: 'Task\'s team not found.' };
    }
    // Only assigned user, team leader, or admin can update task details
    const isAuthorized = requestingUserRole === client_1.Role.ADMIN || team.leaderId === requestingUserId || task.assignedToId === requestingUserId;
    if (!isAuthorized) {
        throw { statusCode: 403, message: 'You are not authorized to update this task.' };
    }
    if (data.assignedToId && data.assignedToId !== task.assignedToId) {
        const assignedToUser = await (0, user_repository_1.findUserById)(data.assignedToId);
        if (!assignedToUser) {
            throw { statusCode: 404, message: 'New assigned user not found.' };
        }
        const isMember = await (0, team_repository_1.isUserTeamMember)(task.teamId, data.assignedToId);
        if (!isMember) {
            throw { statusCode: 400, message: 'New assigned user is not a member of this team.' };
        }
    }
    return prisma_1.default.$transaction(async (tx) => {
        const updateData = { ...data }; // Copia os dados de entrada
        if (data.difficulty) {
            updateData.pointsReward = getPointsForDifficulty(data.difficulty); // Atribui pointsReward a updateData
        }
        const updatedTask = await (0, task_repository_1.updateTask)(id, updateData, tx);
        if (data.assignedToId && data.assignedToId !== task.assignedToId) {
            const assignedUser = data.assignedToId ? await (0, user_repository_1.findUserById)(data.assignedToId) : null;
            await (0, activityLog_repository_1.createActivityLog)({
                user: { connect: { id: requestingUserId } },
                type: client_1.ActivityType.TASK_ASSIGNED,
                description: `Assigned task "${updatedTask.title}" to ${assignedUser?.name || 'unassigned'}.`,
            }, tx);
        }
        return updatedTask;
    });
};
exports.updateTaskDetails = updateTaskDetails;
const moveTaskStatus = async (id, data, requestingUserId, requestingUserRole) => {
    const task = await (0, task_repository_1.findTaskById)(id);
    if (!task) {
        throw { statusCode: 404, message: 'Task not found.' };
    }
    const team = await (0, team_repository_1.findTeamById)(task.teamId);
    if (!team) {
        throw { statusCode: 404, message: 'Task\'s team not found.' };
    }
    // Authorization:
    // - Admin can move any task.
    // - Team Leader can move any task in their team.
    // - Assigned user can move tasks between BACKLOG, IN_PROGRESS, REVIEW.
    // - Only Leader/Admin can move to DONE.
    const isTeamLeader = team.leaderId === requestingUserId;
    const isAdmin = requestingUserRole === client_1.Role.ADMIN;
    const isAssignedUser = task.assignedToId === requestingUserId;
    if (!isAdmin && !isTeamLeader && !isAssignedUser) {
        throw { statusCode: 403, message: 'You are not authorized to move this task.' };
    }
    if (data.newStatus === client_1.TaskStatus.DONE && !isAdmin && !isTeamLeader) {
        throw { statusCode: 403, message: 'Only team leaders or administrators can mark tasks as DONE.' };
    }
    if (task.status === data.newStatus) {
        return task; // No change needed
    }
    return prisma_1.default.$transaction(async (tx) => {
        const updateData = { status: data.newStatus };
        if (data.newStatus === client_1.TaskStatus.DONE && !task.completedAt) {
            // Only add points if moving to DONE for the first time
            updateData.completedAt = new Date();
            if (task.assignedToId) {
                await (0, gamification_service_1.addPointsForTaskCompletion)(task.assignedToId, task.pointsReward, task.id, tx);
                await (0, gamification_service_1.updateStreakForUser)(task.assignedToId, tx);
            }
        }
        else if (data.newStatus !== client_1.TaskStatus.DONE && task.completedAt) {
            // If moving out of DONE, reset completedAt (optional, depends on business rule)
            // For now, we'll assume points are not revoked if moved out of DONE.
            // If points should be revoked, more complex logic is needed here.
            updateData.completedAt = null;
        }
        const updatedTask = await (0, task_repository_1.updateTask)(id, updateData, tx);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: requestingUserId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.TASK_STATUS_CHANGED,
            description: `Moved task "${updatedTask.title}" from ${task.status} to ${updatedTask.status}.`,
        }, tx);
        return updatedTask;
    });
};
exports.moveTaskStatus = moveTaskStatus;
const deleteTaskById = async (id, requestingUserId, requestingUserRole) => {
    const task = await (0, task_repository_1.findTaskById)(id);
    if (!task) {
        throw { statusCode: 404, message: 'Task not found.' };
    }
    const team = await (0, team_repository_1.findTeamById)(task.teamId);
    if (!team) {
        throw { statusCode: 404, message: 'Task\'s team not found.' };
    }
    // Only team leader or admin can delete tasks
    const isAuthorized = requestingUserRole === client_1.Role.ADMIN || team.leaderId === requestingUserId;
    if (!isAuthorized) {
        throw { statusCode: 403, message: 'You are not authorized to delete this task.' };
    }
    return prisma_1.default.$transaction(async (tx) => {
        await (0, task_repository_1.deleteTask)(id);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: requestingUserId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.TASK_DELETED, // Usar um tipo mais específico
            description: `Deleted task "${task.title}".`,
        }, tx);
        return task;
    });
};
exports.deleteTaskById = deleteTaskById;
const getKanbanBoardForTeam = async (teamId) => {
    const team = await (0, team_repository_1.findTeamById)(teamId);
    if (!team) {
        throw { statusCode: 404, message: 'Team not found.' };
    }
    const tasks = await (0, task_repository_1.findTasksByTeamId)(teamId);
    const kanbanBoard = {
        BACKLOG: [],
        IN_PROGRESS: [],
        REVIEW: [],
        DONE: [],
    };
    tasks.forEach(task => {
        kanbanBoard[task.status].push(task);
    });
    return kanbanBoard;
};
exports.getKanbanBoardForTeam = getKanbanBoardForTeam;
const getMyNextTasks = async (userId) => {
    return (0, task_repository_1.findUserTasks)(userId, undefined); // Get all tasks not DONE
};
exports.getMyNextTasks = getMyNextTasks;
const getPointsForDifficulty = (difficulty) => {
    switch (difficulty) {
        case client_1.TaskDifficulty.EASY:
            return 10;
        case client_1.TaskDifficulty.MEDIUM:
            return 20;
        case client_1.TaskDifficulty.HARD:
            return 40;
        default:
            return 0;
    }
};
