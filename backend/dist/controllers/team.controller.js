"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMember = exports.addMember = exports.deleteTeam = exports.updateTeam = exports.getTeams = exports.getTeam = exports.createTeam = void 0;
const team_service_1 = require("../services/team.service");
const createTeam = async (req, res, next) => {
    try {
        const creatorId = req.user.userId;
        const team = await (0, team_service_1.createNewTeam)(req.body, creatorId);
        res.status(201).json(team);
    }
    catch (error) {
        next(error);
    }
};
exports.createTeam = createTeam;
const getTeam = async (req, res, next) => {
    try {
        const { id } = req.params;
        const team = await (0, team_service_1.getTeamDetails)(id);
        res.status(200).json(team);
    }
    catch (error) {
        next(error);
    }
};
exports.getTeam = getTeam;
const getTeams = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await (0, team_service_1.getAllTeams)(page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getTeams = getTeams;
const updateTeam = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user.userId;
        const requestingUserRole = req.user.role;
        const updatedTeam = await (0, team_service_1.updateTeamDetails)(id, req.body, requestingUserId, requestingUserRole);
        res.status(200).json(updatedTeam);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTeam = updateTeam;
const deleteTeam = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;
        const deletedTeam = await (0, team_service_1.deleteTeamById)(id, adminId);
        res.status(200).json({ message: 'Team deleted successfully', team: deletedTeam });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTeam = deleteTeam;
const addMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user.userId;
        const requestingUserRole = req.user.role;
        const teamMember = await (0, team_service_1.addMemberToTeam)(id, req.body, requestingUserId, requestingUserRole);
        res.status(201).json(teamMember);
    }
    catch (error) {
        next(error);
    }
};
exports.addMember = addMember;
const removeMember = async (req, res, next) => {
    try {
        const { id, userId } = req.params;
        const requestingUserId = req.user.userId;
        const requestingUserRole = req.user.role;
        const teamMember = await (0, team_service_1.removeMemberFromTeam)(id, userId, requestingUserId, requestingUserRole);
        res.status(200).json({ message: 'Member removed successfully', teamMember });
    }
    catch (error) {
        next(error);
    }
};
exports.removeMember = removeMember;
