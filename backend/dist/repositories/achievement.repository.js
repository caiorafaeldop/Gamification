"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countUserAchievements = exports.findUserAchievements = exports.findUserAchievement = exports.awardUserAchievement = exports.deleteAchievement = exports.updateAchievement = exports.findAllAchievements = exports.findAchievementByName = exports.findAchievementById = exports.createAchievement = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createAchievement = async (data) => {
    return prisma_1.default.achievement.create({ data });
};
exports.createAchievement = createAchievement;
const findAchievementById = async (id) => {
    return prisma_1.default.achievement.findUnique({ where: { id } });
};
exports.findAchievementById = findAchievementById;
const findAchievementByName = async (name) => {
    return prisma_1.default.achievement.findUnique({ where: { name } });
};
exports.findAchievementByName = findAchievementByName;
const findAllAchievements = async () => {
    return prisma_1.default.achievement.findMany({ orderBy: { name: 'asc' } });
};
exports.findAllAchievements = findAllAchievements;
const updateAchievement = async (id, data) => {
    return prisma_1.default.achievement.update({ where: { id }, data });
};
exports.updateAchievement = updateAchievement;
const deleteAchievement = async (id) => {
    return prisma_1.default.achievement.delete({ where: { id } });
};
exports.deleteAchievement = deleteAchievement;
const awardUserAchievement = async (userId, achievementId, transaction) => {
    const client = transaction || prisma_1.default;
    return client.userAchievement.create({
        data: { userId, achievementId },
    });
};
exports.awardUserAchievement = awardUserAchievement;
const findUserAchievement = async (userId, achievementId) => {
    return prisma_1.default.userAchievement.findUnique({
        where: {
            userId_achievementId: { userId, achievementId },
        },
    });
};
exports.findUserAchievement = findUserAchievement;
const findUserAchievements = async (userId, params) => {
    const { skip, take, orderBy } = params || {};
    return prisma_1.default.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        skip,
        take,
        orderBy: orderBy || { earnedAt: 'desc' },
    });
};
exports.findUserAchievements = findUserAchievements;
const countUserAchievements = async (userId) => {
    return prisma_1.default.userAchievement.count({ where: { userId } });
};
exports.countUserAchievements = countUserAchievements;
