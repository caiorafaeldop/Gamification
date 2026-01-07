"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateUser = exports.deactivateUser = exports.promoteUserRole = exports.getAllUsers = exports.getUserActivity = exports.adjustUserPoints = exports.updateUserDetails = exports.getUserProfile = exports.getMyProfile = void 0;
const client_1 = require("@prisma/client");
const user_repository_1 = require("../repositories/user.repository");
const activityLog_repository_1 = require("../repositories/activityLog.repository");
const bcrypt_1 = require("../utils/bcrypt");
const gamification_service_1 = require("./gamification.service");
const prisma_1 = __importDefault(require("../utils/prisma"));
const getMyProfile = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: {
            tier: true,
            memberOfTeams: {
                include: { team: { select: { id: true, name: true, description: true } } },
            },
            assignedTasks: {
                where: { status: { not: 'DONE' } },
                orderBy: { dueDate: 'asc' },
                take: 5,
                include: { team: { select: { name: true } } },
            },
        },
    });
    if (!user) {
        throw { statusCode: 404, message: 'User not found.' };
    }
    // Exclude sensitive data
    const { passwordHash, ...userWithoutHash } = user;
    return userWithoutHash;
};
exports.getMyProfile = getMyProfile;
const getUserProfile = async (id) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id },
        include: {
            tier: true,
            memberOfTeams: {
                include: { team: { select: { id: true, name: true } } },
            },
        },
    });
    if (!user) {
        throw { statusCode: 404, message: 'User not found.' };
    }
    const { passwordHash, ...userWithoutHash } = user;
    return userWithoutHash;
};
exports.getUserProfile = getUserProfile;
const updateUserDetails = async (userId, data, requestingUserRole) => {
    const user = await (0, user_repository_1.findUserById)(userId);
    if (!user) {
        throw { statusCode: 404, message: 'User not found.' };
    }
    // Prevent non-admins from changing roles or isActive status
    if (requestingUserRole !== client_1.Role.ADMIN) {
        if (data.role && data.role !== user.role) {
            throw { statusCode: 403, message: 'Only administrators can change user roles.' };
        }
        if (data.isActive !== undefined && data.isActive !== user.isActive) {
            throw { statusCode: 403, message: 'Only administrators can change user active status.' };
        }
    }
    if (data.password) {
        data.password = await (0, bcrypt_1.hashPassword)(data.password);
    }
    const updatedUser = await (0, user_repository_1.updateUser)(userId, data);
    const { passwordHash, ...userWithoutHash } = updatedUser;
    return userWithoutHash;
};
exports.updateUserDetails = updateUserDetails;
const adjustUserPoints = async (userId, data, adminId) => {
    return prisma_1.default.$transaction(async (tx) => {
        const user = await (0, user_repository_1.findUserById)(userId);
        if (!user) {
            throw { statusCode: 404, message: 'User not found.' };
        }
        const updatedUser = await (0, user_repository_1.updateConnectaPoints)(userId, data.points, tx);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.POINTS_ADJUSTED,
            description: `Points adjusted by admin (${adminId}): ${data.points > 0 ? '+' : ''}${data.points} for "${data.reason}"`,
            pointsChange: data.points,
        }, tx);
        await (0, gamification_service_1.recalcUserTier)(userId, tx);
        const { passwordHash, ...userWithoutHash } = updatedUser;
        return userWithoutHash;
    });
};
exports.adjustUserPoints = adjustUserPoints;
const getUserActivity = async (userId, page, limit) => {
    const skip = (page - 1) * limit;
    const activities = await (0, activityLog_repository_1.findActivityLogsByUserId)(userId, limit); // No skip for now, just take latest
    return activities;
};
exports.getUserActivity = getUserActivity;
const getAllUsers = async (page, limit) => {
    const skip = (page - 1) * limit;
    const users = await (0, user_repository_1.findUsers)({
        skip,
        take: limit,
        orderBy: { connectaPoints: 'desc' },
    });
    const total = await prisma_1.default.user.count();
    return { users: users.map(({ passwordHash, ...user }) => user), total, page, limit };
};
exports.getAllUsers = getAllUsers;
const promoteUserRole = async (userId, newRole, adminId) => {
    if (newRole === client_1.Role.ADMIN) {
        throw { statusCode: 403, message: 'Cannot promote to ADMIN via this endpoint.' };
    }
    return prisma_1.default.$transaction(async (tx) => {
        const user = await (0, user_repository_1.findUserById)(userId);
        if (!user) {
            throw { statusCode: 404, message: 'User not found.' };
        }
        if (user.role === newRole) {
            return user; // No change needed
        }
        const updatedUser = await (0, user_repository_1.updateUser)(userId, { role: newRole }, tx);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.ROLE_CHANGED,
            description: `Role changed to ${newRole} by admin (${adminId}).`,
        }, tx);
        return updatedUser;
    });
};
exports.promoteUserRole = promoteUserRole;
const deactivateUser = async (userId, adminId) => {
    return prisma_1.default.$transaction(async (tx) => {
        const user = await (0, user_repository_1.findUserById)(userId);
        if (!user) {
            throw { statusCode: 404, message: 'User not found.' };
        }
        if (user.role === client_1.Role.ADMIN && user.id !== adminId) { // Prevent admin from deactivating other admins
            throw { statusCode: 403, message: 'Cannot deactivate another admin.' };
        }
        const updatedUser = await (0, user_repository_1.updateUser)(userId, { isActive: false }, tx);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.USER_STATUS_CHANGED, // Usar um tipo mais específico
            description: `User deactivated by admin (${adminId}).`,
        }, tx);
        return updatedUser;
    });
};
exports.deactivateUser = deactivateUser;
const activateUser = async (userId, adminId) => {
    return prisma_1.default.$transaction(async (tx) => {
        const user = await (0, user_repository_1.findUserById)(userId);
        if (!user) {
            throw { statusCode: 404, message: 'User not found.' };
        }
        const updatedUser = await (0, user_repository_1.updateUser)(userId, { isActive: true }, tx);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.USER_STATUS_CHANGED, // Usar um tipo mais específico
            description: `User activated by admin (${adminId}).`,
        }, tx);
        return updatedUser;
    });
};
exports.activateUser = activateUser;
