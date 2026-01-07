"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMemberFromTeam = exports.addMemberToTeam = exports.deleteTeamById = exports.updateTeamDetails = exports.getAllTeams = exports.getTeamDetails = exports.createNewTeam = void 0;
const client_1 = require("@prisma/client");
const team_repository_1 = require("../repositories/team.repository");
const user_repository_1 = require("../repositories/user.repository");
const activityLog_repository_1 = require("../repositories/activityLog.repository");
const prisma_1 = __importDefault(require("../utils/prisma"));
const createNewTeam = async (data, creatorId) => {
    const leader = await (0, user_repository_1.findUserById)(data.leaderId);
    if (!leader) {
        throw { statusCode: 404, message: 'Leader not found.' };
    }
    if (leader.role === client_1.Role.MEMBER) {
        // Automatically promote member to leader if they are assigned as leader of a new team
        await (0, user_repository_1.updateUser)(leader.id, { role: client_1.Role.LEADER });
    }
    return prisma_1.default.$transaction(async (tx) => {
        const team = await (0, team_repository_1.createTeam)({
            name: data.name,
            description: data.description,
            focusArea: data.focusArea,
            leader: { connect: { id: data.leaderId } },
            members: {
                create: [{ userId: data.leaderId }], // Leader is automatically a member
            },
        });
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: creatorId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.TEAM_CREATED,
            description: `Created team "${team.name}" with ${leader.name} as leader.`,
        }, tx);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: leader.id } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.USER_JOINED_TEAM,
            description: `Joined team "${team.name}" as leader.`,
        }, tx);
        return team;
    });
};
exports.createNewTeam = createNewTeam;
const getTeamDetails = async (id) => {
    const team = await (0, team_repository_1.findTeamById)(id);
    if (!team) {
        throw { statusCode: 404, message: 'Team not found.' };
    }
    return team;
};
exports.getTeamDetails = getTeamDetails;
const getAllTeams = async (page, limit) => {
    const skip = (page - 1) * limit;
    const teams = await (0, team_repository_1.findTeams)({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
    });
    const total = await prisma_1.default.team.count();
    return { teams, total, page, limit };
};
exports.getAllTeams = getAllTeams;
const updateTeamDetails = async (id, data, requestingUserId, requestingUserRole) => {
    const team = await (0, team_repository_1.findTeamById)(id);
    if (!team) {
        throw { statusCode: 404, message: 'Team not found.' };
    }
    // Only leader of the team or an admin can update team details
    if (requestingUserRole !== client_1.Role.ADMIN && team.leaderId !== requestingUserId) {
        throw { statusCode: 403, message: 'Only the team leader or an admin can update this team.' };
    }
    if (data.leaderId && data.leaderId !== team.leaderId) {
        const newLeader = await (0, user_repository_1.findUserById)(data.leaderId);
        if (!newLeader) {
            throw { statusCode: 404, message: 'New leader not found.' };
        }
        // Ensure new leader is a member of the team, if not, add them
        const isMember = await (0, team_repository_1.isUserTeamMember)(id, newLeader.id);
        if (!isMember) {
            await (0, team_repository_1.addTeamMember)(id, newLeader.id);
            await (0, activityLog_repository_1.createActivityLog)({
                user: { connect: { id: newLeader.id } }, // Corrigido: usar 'user' com 'connect'
                type: client_1.ActivityType.USER_JOINED_TEAM,
                description: `Joined team "${team.name}".`,
            });
        }
        // Promote new leader to LEADER role if they are currently MEMBER
        if (newLeader.role === client_1.Role.MEMBER) {
            await (0, user_repository_1.updateUser)(newLeader.id, { role: client_1.Role.LEADER });
        }
    }
    const updatedTeam = await (0, team_repository_1.updateTeam)(id, data);
    return updatedTeam;
};
exports.updateTeamDetails = updateTeamDetails;
const deleteTeamById = async (id, adminId) => {
    const team = await (0, team_repository_1.findTeamById)(id);
    if (!team) {
        throw { statusCode: 404, message: 'Team not found.' };
    }
    return prisma_1.default.$transaction(async (tx) => {
        await (0, team_repository_1.deleteTeam)(id);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: adminId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.TEAM_DELETED, // Usar um tipo mais específico
            description: `Deleted team "${team.name}".`,
        }, tx);
        return team;
    });
};
exports.deleteTeamById = deleteTeamById;
const addMemberToTeam = async (teamId, data, requestingUserId, requestingUserRole) => {
    const team = await (0, team_repository_1.findTeamById)(teamId);
    if (!team) {
        throw { statusCode: 404, message: 'Team not found.' };
    }
    // Only leader of the team or an admin can add members
    if (requestingUserRole !== client_1.Role.ADMIN && team.leaderId !== requestingUserId) {
        throw { statusCode: 403, message: 'Only the team leader or an admin can add members to this team.' };
    }
    const user = await (0, user_repository_1.findUserById)(data.userId);
    if (!user) {
        throw { statusCode: 404, message: 'User not found.' };
    }
    const isMember = await (0, team_repository_1.isUserTeamMember)(teamId, data.userId);
    if (isMember) {
        throw { statusCode: 409, message: 'User is already a member of this team.' };
    }
    return prisma_1.default.$transaction(async (tx) => {
        const teamMember = await (0, team_repository_1.addTeamMember)(teamId, data.userId);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: data.userId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.USER_JOINED_TEAM,
            description: `Joined team "${team.name}".`,
        }, tx);
        return teamMember;
    });
};
exports.addMemberToTeam = addMemberToTeam;
const removeMemberFromTeam = async (teamId, userId, requestingUserId, requestingUserRole) => {
    const team = await prisma_1.default.team.findUnique({
        where: { id: teamId },
        include: { members: { include: { user: true } } },
    });
    if (!team) {
        throw { statusCode: 404, message: 'Team not found.' };
    }
    // Only leader of the team or an admin can remove members
    if (requestingUserRole !== client_1.Role.ADMIN && team.leaderId !== requestingUserId) {
        throw { statusCode: 403, message: 'Only the team leader or an admin can remove members from this team.' };
    }
    const isMember = await (0, team_repository_1.isUserTeamMember)(teamId, userId);
    if (!isMember) {
        throw { statusCode: 404, message: 'User is not a member of this team.' };
    }
    // Prevent leader from removing themselves if they are the only leader
    // A propriedade 'members' é incluída em findTeamById agora.
    if (team.leaderId === userId && team.members.filter(m => m.user.role === client_1.Role.LEADER).length === 1) {
        throw { statusCode: 400, message: 'Cannot remove the only leader from the team. Assign a new leader first.' };
    }
    return prisma_1.default.$transaction(async (tx) => {
        const teamMember = await (0, team_repository_1.removeTeamMember)(teamId, userId);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.USER_LEFT_TEAM,
            description: `Left team "${team.name}".`,
        }, tx);
        return teamMember;
    });
};
exports.removeMemberFromTeam = removeMemberFromTeam;
