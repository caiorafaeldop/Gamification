"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserTeamMember = exports.removeTeamMember = exports.addTeamMember = exports.deleteTeam = exports.updateTeam = exports.findTeams = exports.findTeamById = exports.createTeam = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createTeam = async (data) => {
    return prisma_1.default.team.create({ data });
};
exports.createTeam = createTeam;
const findTeamById = async (id) => {
    return prisma_1.default.team.findUnique({
        where: { id },
        include: {
            leader: { select: { id: true, name: true, email: true } },
            members: { include: { user: { select: { id: true, name: true, email: true, connectaPoints: true, tier: true, streakCurrent: true, streakBest: true } } } }, // Incluído membros
            tasks: {
                include: {
                    assignedTo: { select: { id: true, name: true } },
                    createdBy: { select: { id: true, name: true } },
                    requiredTier: true,
                },
                orderBy: { createdAt: 'asc' },
            },
        },
    });
};
exports.findTeamById = findTeamById;
const findTeams = async (params) => {
    const { skip, take, cursor, where, orderBy } = params;
    return prisma_1.default.team.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {
            leader: { select: { id: true, name: true, email: true } },
            _count: {
                select: { members: true, tasks: true },
            },
        },
    });
};
exports.findTeams = findTeams;
const updateTeam = async (id, data) => {
    return prisma_1.default.team.update({ where: { id }, data });
};
exports.updateTeam = updateTeam;
const deleteTeam = async (id) => {
    return prisma_1.default.team.delete({ where: { id } });
};
exports.deleteTeam = deleteTeam;
const addTeamMember = async (teamId, userId) => {
    return prisma_1.default.teamMember.create({
        data: { teamId, userId },
    });
};
exports.addTeamMember = addTeamMember;
const removeTeamMember = async (teamId, userId) => {
    return prisma_1.default.teamMember.delete({
        where: {
            teamId_userId: { teamId, userId },
        },
    });
};
exports.removeTeamMember = removeTeamMember;
const isUserTeamMember = async (teamId, userId) => {
    const member = await prisma_1.default.teamMember.findUnique({
        where: {
            teamId_userId: { teamId, userId },
        },
    });
    return !!member;
};
exports.isUserTeamMember = isUserTeamMember;
