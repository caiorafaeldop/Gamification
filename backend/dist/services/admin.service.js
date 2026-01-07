"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOverwriteConnectaPoints = exports.adminToggleUserActiveStatus = exports.adminUpdateUserRole = exports.adminDeleteTier = exports.adminUpdateTier = exports.adminCreateTier = exports.adminDeleteTeam = exports.adminUpdateTeam = exports.adminCreateTeam = void 0;
const client_1 = require("@prisma/client");
const user_repository_1 = require("../repositories/user.repository");
const activityLog_repository_1 = require("../repositories/activityLog.repository");
const team_service_1 = require("./team.service");
const tier_service_1 = require("./tier.service");
const prisma_1 = __importDefault(require("../utils/prisma"));
// This service centralizes admin-specific operations, often delegating to other services
// but ensuring admin-level permissions and logging.
const adminCreateTeam = async (data, adminId) => {
    return (0, team_service_1.createNewTeam)(data, adminId);
};
exports.adminCreateTeam = adminCreateTeam;
const adminUpdateTeam = async (teamId, data, adminId) => {
    return (0, team_service_1.updateTeamDetails)(teamId, data, adminId, client_1.Role.ADMIN);
};
exports.adminUpdateTeam = adminUpdateTeam;
const adminDeleteTeam = async (teamId, adminId) => {
    return (0, team_service_1.deleteTeamById)(teamId, adminId);
};
exports.adminDeleteTeam = adminDeleteTeam;
const adminCreateTier = async (data) => {
    return (0, tier_service_1.createNewTier)(data);
};
exports.adminCreateTier = adminCreateTier;
const adminUpdateTier = async (tierId, data) => {
    return (0, tier_service_1.updateTierDetails)(tierId, data);
};
exports.adminUpdateTier = adminUpdateTier;
const adminDeleteTier = async (tierId) => {
    return (0, tier_service_1.deleteTierById)(tierId);
};
exports.adminDeleteTier = adminDeleteTier;
const adminUpdateUserRole = async (userId, newRole, adminId) => {
    return prisma_1.default.$transaction(async (tx) => {
        const user = await (0, user_repository_1.findUserById)(userId);
        if (!user) {
            throw { statusCode: 404, message: 'User not found.' };
        }
        if (user.id === adminId && newRole !== client_1.Role.ADMIN) {
            throw { statusCode: 400, message: 'An admin cannot demote themselves.' };
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
exports.adminUpdateUserRole = adminUpdateUserRole;
const adminToggleUserActiveStatus = async (userId, isActive, adminId) => {
    return prisma_1.default.$transaction(async (tx) => {
        const user = await (0, user_repository_1.findUserById)(userId);
        if (!user) {
            throw { statusCode: 404, message: 'User not found.' };
        }
        if (user.id === adminId && !isActive) {
            throw { statusCode: 400, message: 'An admin cannot deactivate themselves.' };
        }
        const updatedUser = await (0, user_repository_1.updateUser)(userId, { isActive }, tx);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.USER_STATUS_CHANGED, // Usar um tipo mais específico
            description: `User ${isActive ? 'activated' : 'deactivated'} by admin (${adminId}).`,
        }, tx);
        return updatedUser;
    });
};
exports.adminToggleUserActiveStatus = adminToggleUserActiveStatus;
const adminOverwriteConnectaPoints = async (userId, points, reason, adminId) => {
    return prisma_1.default.$transaction(async (tx) => {
        const user = await (0, user_repository_1.findUserById)(userId);
        if (!user) {
            throw { statusCode: 404, message: 'User not found.' };
        }
        const updatedUser = await (0, user_repository_1.updateUser)(userId, { connectaPoints: points }, tx);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.POINTS_ADJUSTED,
            description: `Connecta Points overwritten to ${points} by admin (${adminId}) for "${reason}".`,
            pointsChange: points - user.connectaPoints, // Log the change amount
        }, tx);
        return updatedUser;
    });
};
exports.adminOverwriteConnectaPoints = adminOverwriteConnectaPoints;
