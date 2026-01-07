"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamKanban = exports.deleteTask = exports.moveTask = exports.updateTask = exports.getTask = exports.createTask = void 0;
const task_service_1 = require("../services/task.service");
const createTask = async (req, res, next) => {
    try {
        const createdById = req.user.userId;
        const task = await (0, task_service_1.createNewTask)(req.body, createdById);
        res.status(201).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.createTask = createTask;
const getTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await (0, task_service_1.getTaskDetails)(id);
        res.status(200).json(task);
    }
    catch (error) {
        next(error);
    }
};
exports.getTask = getTask;
const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user.userId;
        const requestingUserRole = req.user.role;
        const updatedTask = await (0, task_service_1.updateTaskDetails)(id, req.body, requestingUserId, requestingUserRole);
        res.status(200).json(updatedTask);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTask = updateTask;
const moveTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user.userId;
        const requestingUserRole = req.user.role;
        const movedTask = await (0, task_service_1.moveTaskStatus)(id, req.body, requestingUserId, requestingUserRole);
        res.status(200).json(movedTask);
    }
    catch (error) {
        next(error);
    }
};
exports.moveTask = moveTask;
const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user.userId;
        const requestingUserRole = req.user.role;
        const deletedTask = await (0, task_service_1.deleteTaskById)(id, requestingUserId, requestingUserRole);
        res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTask = deleteTask;
const getTeamKanban = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const kanban = await (0, task_service_1.getKanbanBoardForTeam)(teamId);
        res.status(200).json(kanban);
    }
    catch (error) {
        next(error);
    }
};
exports.getTeamKanban = getTeamKanban;
