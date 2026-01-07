"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyLeaderboard = exports.getTeamLeaderboard = exports.getGlobalLeaderboard = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const client_1 = require("@prisma/client");
const getGlobalLeaderboard = async (page, limit) => {
    const skip = (page - 1) * limit;
    const users = await prisma_1.default.user.findMany({
        skip,
        take: limit,
        orderBy: { connectaPoints: 'desc' },
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            email: true,
            connectaPoints: true,
            streakCurrent: true,
            streakBest: true,
            tier: { select: { name: true, icon: true } },
        },
    });
    const totalUsers = await prisma_1.default.user.count({ where: { isActive: true } });
    return { users, total: totalUsers, page, limit };
};
exports.getGlobalLeaderboard = getGlobalLeaderboard;
const getTeamLeaderboard = async (teamId, page, limit) => {
    const skip = (page - 1) * limit;
    const team = await prisma_1.default.team.findUnique({
        where: { id: teamId },
        include: {
            members: {
                skip,
                take: limit,
                orderBy: { user: { connectaPoints: 'desc' } },
                where: { user: { isActive: true } },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            connectaPoints: true,
                            streakCurrent: true,
                            streakBest: true,
                            tier: { select: { name: true, icon: true } },
                        },
                    },
                },
            },
        },
    });
    if (!team) {
        throw { statusCode: 404, message: 'Team not found.' };
    }
    const members = team.members.map(tm => tm.user);
    const totalMembers = await prisma_1.default.teamMember.count({ where: { teamId, user: { isActive: true } } });
    return { teamName: team.name, members, total: totalMembers, page, limit };
};
exports.getTeamLeaderboard = getTeamLeaderboard;
const getWeeklyLeaderboard = async (page, limit) => {
    const skip = (page - 1) * limit;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    // This is a simplified weekly leaderboard based on points gained in the last week.
    // A more robust solution would involve tracking weekly points separately or more complex activity log aggregation.
    // For now, we'll fetch users and filter/sort by recent activity or a proxy.
    // A direct "points gained this week" is not easily queryable without a dedicated field or complex aggregation.
    // Let's just return the global leaderboard for now, and mention this limitation.
    // Or, we can fetch all users and calculate points gained from activity logs, which is expensive.
    // For simplicity, let's return users who have completed tasks in the last week, ordered by their current points.
    // This is a proxy, not strictly "points gained this week".
    const usersWithRecentActivity = await prisma_1.default.user.findMany({
        where: {
            isActive: true,
            activityLogs: {
                some: {
                    createdAt: { gte: oneWeekAgo },
                    type: client_1.ActivityType.TASK_COMPLETED,
                },
            },
        },
        orderBy: { connectaPoints: 'desc' }, // Order by total points, not just weekly gained
        select: {
            id: true,
            name: true,
            email: true,
            connectaPoints: true,
            streakCurrent: true,
            streakBest: true,
            tier: { select: { name: true, icon: true } },
        },
        skip,
        take: limit,
    });
    const totalUsers = await prisma_1.default.user.count({
        where: {
            isActive: true,
            activityLogs: {
                some: {
                    createdAt: { gte: oneWeekAgo },
                    type: client_1.ActivityType.TASK_COMPLETED,
                },
            },
        },
    });
    return { users: usersWithRecentActivity, total: totalUsers, page, limit };
};
exports.getWeeklyLeaderboard = getWeeklyLeaderboard;
