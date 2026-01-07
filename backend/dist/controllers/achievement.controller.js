"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAchievementsById = exports.getMyAchievements = exports.deleteAchievement = exports.updateAchievement = exports.getAchievements = exports.getAchievement = exports.createAchievement = void 0;
const achievement_service_1 = require("../services/achievement.service");
const createAchievement = async (req, res, next) => {
    try {
        const achievement = await (0, achievement_service_1.createNewAchievement)(req.body);
        res.status(201).json(achievement);
    }
    catch (error) {
        next(error);
    }
};
exports.createAchievement = createAchievement;
const getAchievement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const achievement = await (0, achievement_service_1.getAchievementDetails)(id);
        res.status(200).json(achievement);
    }
    catch (error) {
        next(error);
    }
};
exports.getAchievement = getAchievement;
const getAchievements = async (req, res, next) => {
    try {
        const achievements = await (0, achievement_service_1.getAllAchievements)();
        res.status(200).json(achievements);
    }
    catch (error) {
        next(error);
    }
};
exports.getAchievements = getAchievements;
const updateAchievement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedAchievement = await (0, achievement_service_1.updateAchievementDetails)(id, req.body);
        res.status(200).json(updatedAchievement);
    }
    catch (error) {
        next(error);
    }
};
exports.updateAchievement = updateAchievement;
const deleteAchievement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedAchievement = await (0, achievement_service_1.deleteAchievementById)(id);
        res.status(200).json({ message: 'Achievement deleted successfully', achievement: deletedAchievement });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAchievement = deleteAchievement;
const getMyAchievements = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await (0, achievement_service_1.getUserAchievements)(userId, page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getMyAchievements = getMyAchievements;
const getUserAchievementsById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await (0, achievement_service_1.getUserAchievements)(userId, page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserAchievementsById = getUserAchievementsById;
