"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndAwardAchievements = exports.getUserAchievements = exports.deleteAchievementById = exports.updateAchievementDetails = exports.getAllAchievements = exports.getAchievementDetails = exports.createNewAchievement = void 0;
const client_1 = require("@prisma/client");
const achievement_repository_1 = require("../repositories/achievement.repository");
const activityLog_repository_1 = require("../repositories/activityLog.repository");
const prisma_1 = __importDefault(require("../utils/prisma"));
const createNewAchievement = async (data) => {
    const existingAchievement = await (0, achievement_repository_1.findAchievementByName)(data.name);
    if (existingAchievement) {
        throw { statusCode: 409, message: 'Achievement with this name already exists.' };
    }
    const achievement = await (0, achievement_repository_1.createAchievement)(data);
    return achievement;
};
exports.createNewAchievement = createNewAchievement;
const getAchievementDetails = async (id) => {
    const achievement = await (0, achievement_repository_1.findAchievementById)(id);
    if (!achievement) {
        throw { statusCode: 404, message: 'Achievement not found.' };
    }
    return achievement;
};
exports.getAchievementDetails = getAchievementDetails;
const getAllAchievements = async () => {
    return (0, achievement_repository_1.findAllAchievements)();
};
exports.getAllAchievements = getAllAchievements;
const updateAchievementDetails = async (id, data) => {
    const achievement = await (0, achievement_repository_1.findAchievementById)(id);
    if (!achievement) {
        throw { statusCode: 404, message: 'Achievement not found.' };
    }
    const updatedAchievement = await (0, achievement_repository_1.updateAchievement)(id, data);
    return updatedAchievement;
};
exports.updateAchievementDetails = updateAchievementDetails;
const deleteAchievementById = async (id) => {
    const achievement = await (0, achievement_repository_1.findAchievementById)(id);
    if (!achievement) {
        throw { statusCode: 404, message: 'Achievement not found.' };
    }
    // Optionally, check if any users have this achievement before deleting
    const usersWithAchievement = await prisma_1.default.userAchievement.count({ where: { achievementId: id } });
    if (usersWithAchievement > 0) {
        throw { statusCode: 400, message: 'Cannot delete achievement that has been earned by users.' };
    }
    await (0, achievement_repository_1.deleteAchievement)(id);
    return achievement;
};
exports.deleteAchievementById = deleteAchievementById;
const getUserAchievements = async (userId, page, limit) => {
    const skip = (page - 1) * limit;
    const achievements = await (0, achievement_repository_1.findUserAchievements)(userId, { skip, take: limit });
    const total = await (0, achievement_repository_1.countUserAchievements)(userId);
    return { achievements, total, page, limit };
};
exports.getUserAchievements = getUserAchievements;
// --- Core Gamification Logic for Achievements ---
// This function will be called by other services (e.g., gamification.service)
// to check if a user has earned any new achievements based on their current state.
const checkAndAwardAchievements = async (userId, transaction) => {
    const user = await transaction.user.findUnique({
        where: { id: userId },
        include: {
            _count: {
                select: {
                    assignedTasks: { where: { status: 'DONE' } },
                },
            },
        },
    });
    if (!user) {
        console.warn(`User ${userId} not found for achievement check.`);
        return;
    }
    const allAchievements = await (0, achievement_repository_1.findAllAchievements)();
    const earnedAchievements = await (0, achievement_repository_1.findUserAchievements)(userId);
    const earnedAchievementIds = new Set(earnedAchievements.map(ua => ua.achievementId));
    for (const achievement of allAchievements) {
        if (earnedAchievementIds.has(achievement.id)) {
            continue; // Already earned
        }
        let isEarned = false;
        // Implement specific criteria checks here
        // This is a simplified example. In a real app, `criteria` could be a JSON object
        // or a more structured field that allows for dynamic evaluation.
        if (achievement.criteria.includes('points')) {
            const pointsThreshold = parseInt(achievement.criteria.split(' ')[1]); // e.g., "Reach 100 points" -> 100
            if (!isNaN(pointsThreshold) && user.connectaPoints >= pointsThreshold) {
                isEarned = true;
            }
        }
        else if (achievement.criteria.includes('tasks completed')) {
            const tasksCompletedThreshold = parseInt(achievement.criteria.split(' ')[1]); // e.g., "Complete 10 tasks" -> 10
            if (!isNaN(tasksCompletedThreshold) && user._count.assignedTasks >= tasksCompletedThreshold) {
                isEarned = true;
            }
        }
        else if (achievement.criteria.includes('streak')) {
            const streakThreshold = parseInt(achievement.criteria.split(' ')[1]); // e.g., "Maintain a 5-day streak" -> 5
            if (!isNaN(streakThreshold) && user.streakCurrent >= streakThreshold) {
                isEarned = true;
            }
        }
        // Add more criteria as needed (e.g., "Create 3 teams", "Be a leader")
        if (isEarned) {
            await (0, achievement_repository_1.awardUserAchievement)(userId, achievement.id, transaction);
            await (0, activityLog_repository_1.createActivityLog)({
                user: { connect: { id: userId } },
                type: client_1.ActivityType.ACHIEVEMENT_EARNED,
                description: `Earned achievement: "${achievement.name}"!`,
            }, transaction);
            console.log(`User ${user.name} earned achievement: ${achievement.name}`);
        }
    }
};
exports.checkAndAwardAchievements = checkAndAwardAchievements;
