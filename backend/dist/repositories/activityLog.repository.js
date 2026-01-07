"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRecentActivityLogs = exports.findActivityLogsByUserId = exports.createActivityLog = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createActivityLog = async (data, transaction) => {
    const client = transaction || prisma_1.default;
    return client.activityLog.create({ data });
};
exports.createActivityLog = createActivityLog;
const findActivityLogsByUserId = async (userId, take) => {
    return prisma_1.default.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
    });
};
exports.findActivityLogsByUserId = findActivityLogsByUserId;
const findRecentActivityLogs = async (take = 10) => {
    return prisma_1.default.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take,
        include: { user: { select: { id: true, name: true, email: true } } },
    });
};
exports.findRecentActivityLogs = findRecentActivityLogs;
