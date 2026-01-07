"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyLeaderboard = exports.getTeamLeaderboard = exports.getGlobalLeaderboard = void 0;
const leaderboard_service_1 = require("../services/leaderboard.service");
const getGlobalLeaderboard = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await (0, leaderboard_service_1.getGlobalLeaderboard)(page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getGlobalLeaderboard = getGlobalLeaderboard;
const getTeamLeaderboard = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await (0, leaderboard_service_1.getTeamLeaderboard)(teamId, page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getTeamLeaderboard = getTeamLeaderboard;
const getWeeklyLeaderboard = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await (0, leaderboard_service_1.getWeeklyLeaderboard)(page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getWeeklyLeaderboard = getWeeklyLeaderboard;
