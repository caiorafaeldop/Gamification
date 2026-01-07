"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserTasks = exports.findTasksByTeamId = exports.deleteTask = exports.updateTask = exports.findTaskById = exports.createTask = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createTask = async (data) => {
    return prisma_1.default.task.create({ data });
};
exports.createTask = createTask;
const findTaskById = async (id) => {
    return prisma_1.default.task.findUnique({
        where: { id },
        include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
            team: { select: { id: true, name: true } },
            requiredTier: true,
        },
    });
};
exports.findTaskById = findTaskById;
// Atualizado para aceitar um cliente de transação e incluir relações no retorno
const updateTask = async (id, data, transaction) => {
    const client = transaction || prisma_1.default;
    return client.task.update({
        where: { id },
        data,
        include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
            team: { select: { id: true, name: true } },
            requiredTier: true,
        },
    });
};
exports.updateTask = updateTask;
const deleteTask = async (id) => {
    return prisma_1.default.task.delete({ where: { id } });
};
exports.deleteTask = deleteTask;
const findTasksByTeamId = async (teamId) => {
    return prisma_1.default.task.findMany({
        where: { teamId },
        include: {
            assignedTo: { select: { id: true, name: true } },
            createdBy: { select: { id: true, name: true } },
            requiredTier: true,
        },
        orderBy: { createdAt: 'asc' },
    });
};
exports.findTasksByTeamId = findTasksByTeamId;
const findUserTasks = async (userId, status) => {
    return prisma_1.default.task.findMany({
        where: {
            assignedToId: userId,
            ...(status && { status }),
        },
        include: {
            team: { select: { id: true, name: true } },
            requiredTier: true,
        },
        orderBy: { dueDate: 'asc' },
    });
};
exports.findUserTasks = findUserTasks;
