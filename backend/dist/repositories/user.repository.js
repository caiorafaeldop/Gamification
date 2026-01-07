"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateManyUsers = exports.updateLastActivity = exports.updateUserTier = exports.updateStreak = exports.updateConnectaPoints = exports.countUsers = exports.findUsers = exports.updateUser = exports.createUser = exports.findUserById = exports.findUserByEmail = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const findUserByEmail = async (email) => {
    return prisma_1.default.user.findUnique({ where: { email } });
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (id) => {
    return prisma_1.default.user.findUnique({ where: { id } });
};
exports.findUserById = findUserById;
const createUser = async (data) => {
    return prisma_1.default.user.create({ data });
};
exports.createUser = createUser;
// Atualizado para aceitar um cliente de transação
const updateUser = async (id, data, transaction) => {
    const client = transaction || prisma_1.default;
    return client.user.update({ where: { id }, data });
};
exports.updateUser = updateUser;
const findUsers = async (params) => {
    const { skip, take, cursor, where, orderBy } = params;
    return prisma_1.default.user.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: { tier: true },
    });
};
exports.findUsers = findUsers;
const countUsers = async (where) => {
    return prisma_1.default.user.count({ where });
};
exports.countUsers = countUsers;
const updateConnectaPoints = async (userId, points, transaction) => {
    const client = transaction || prisma_1.default;
    return client.user.update({
        where: { id: userId },
        data: { connectaPoints: { increment: points } },
    });
};
exports.updateConnectaPoints = updateConnectaPoints;
const updateStreak = async (userId, currentStreak, bestStreak, transaction) => {
    const client = transaction || prisma_1.default;
    return client.user.update({
        where: { id: userId },
        data: {
            streakCurrent: currentStreak,
            streakBest: bestStreak,
            lastActivityAt: new Date(),
        },
    });
};
exports.updateStreak = updateStreak;
const updateUserTier = async (userId, tierId, transaction) => {
    const client = transaction || prisma_1.default;
    return client.user.update({
        where: { id: userId },
        data: { tierId },
    });
};
exports.updateUserTier = updateUserTier;
const updateLastActivity = async (userId, transaction) => {
    const client = transaction || prisma_1.default;
    return client.user.update({
        where: { id: userId },
        data: { lastActivityAt: new Date() },
    });
};
exports.updateLastActivity = updateLastActivity;
const updateManyUsers = async (where, data) => {
    return prisma_1.default.user.updateMany({ where, data });
};
exports.updateManyUsers = updateManyUsers;
