"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndResetDailyStreaks = exports.updateStreakForUser = exports.recalcUserTier = exports.addPointsForTaskCompletion = void 0;
const client_1 = require("@prisma/client");
const user_repository_1 = require("../repositories/user.repository");
const activityLog_repository_1 = require("../repositories/activityLog.repository");
const tier_repository_1 = require("../repositories/tier.repository");
const achievement_service_1 = require("./achievement.service"); // Import the new service
const prisma_1 = __importDefault(require("../utils/prisma"));
// Points per task difficulty are defined in task.service.ts, but can be centralized here if needed.
const addPointsForTaskCompletion = async (userId, points, taskId, transaction) => {
    const updatedUser = await (0, user_repository_1.updateConnectaPoints)(userId, points, transaction);
    await (0, activityLog_repository_1.createActivityLog)({
        user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
        type: client_1.ActivityType.TASK_COMPLETED,
        description: `Completed a task and earned ${points} Connecta Points.`,
        pointsChange: points,
    }, transaction);
    await (0, exports.recalcUserTier)(userId, transaction);
    await (0, achievement_service_1.checkAndAwardAchievements)(userId, transaction); // Check for achievements after points update
    return updatedUser;
};
exports.addPointsForTaskCompletion = addPointsForTaskCompletion;
const recalcUserTier = async (userId, transaction) => {
    const user = await transaction.user.findUnique({
        where: { id: userId },
        include: { tier: true },
    });
    if (!user) {
        throw new Error('User not found for tier recalculation.');
    }
    const currentTier = user.tier;
    const newTier = await (0, tier_repository_1.findTierByPoints)(user.connectaPoints);
    if (newTier && newTier.id !== currentTier.id) {
        await (0, user_repository_1.updateUserTier)(userId, newTier.id, transaction);
        await (0, activityLog_repository_1.createActivityLog)({
            user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
            type: client_1.ActivityType.TIER_ACHIEVED,
            description: `Achieved new tier: ${newTier.name}!`,
        }, transaction);
        await (0, achievement_service_1.checkAndAwardAchievements)(userId, transaction); // Check for achievements after tier change
        return newTier;
    }
    return currentTier;
};
exports.recalcUserTier = recalcUserTier;
const updateStreakForUser = async (userId, transaction) => {
    const user = await transaction.user.findUnique({
        where: { id: userId },
        select: { id: true, streakCurrent: true, streakBest: true, lastActivityAt: true },
    });
    if (!user) {
        throw new Error('User not found for streak update.');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const lastActivityDay = user.lastActivityAt ? new Date(user.lastActivityAt) : null;
    if (lastActivityDay) {
        lastActivityDay.setHours(0, 0, 0, 0);
    }
    let newStreakCurrent = user.streakCurrent;
    let newStreakBest = user.streakBest;
    // Calcula a diferença em dias entre hoje e a última atividade
    const diffTime = Math.abs(today.getTime() - (lastActivityDay?.getTime() || 0));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (!lastActivityDay || diffDays > 1) { // Se não houve atividade ontem ou antes, reseta a sequência
        newStreakCurrent = 1;
    }
    else if (diffDays === 1) { // Se a última atividade foi ontem, incrementa a sequência
        newStreakCurrent++;
    }
    // Se a atividade foi hoje, não faz nada (newStreakCurrent permanece o mesmo)
    if (newStreakCurrent > newStreakBest) {
        newStreakBest = newStreakCurrent;
    }
    await (0, user_repository_1.updateStreak)(userId, newStreakCurrent, newStreakBest, transaction);
    await (0, activityLog_repository_1.createActivityLog)({
        user: { connect: { id: userId } }, // Corrigido: usar 'user' com 'connect'
        type: client_1.ActivityType.STREAK_UPDATED,
        description: `Streak updated: Current ${newStreakCurrent}, Best ${newStreakBest}.`,
    }, transaction);
    await (0, achievement_service_1.checkAndAwardAchievements)(userId, transaction); // Check for achievements after streak update
};
exports.updateStreakForUser = updateStreakForUser;
const checkAndResetDailyStreaks = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999); // End of yesterday
    // Find users whose last activity was before yesterday and streak is not 0
    const usersToReset = await prisma_1.default.user.findMany({
        where: {
            lastActivityAt: { lt: yesterday },
            streakCurrent: { gt: 0 },
        },
        select: { id: true, name: true, streakCurrent: true, streakBest: true }, // Incluído streakBest
    });
    if (usersToReset.length > 0) {
        console.log(`Resetting streaks for ${usersToReset.length} users.`);
        await prisma_1.default.$transaction(async (tx) => {
            for (const user of usersToReset) {
                await (0, user_repository_1.updateStreak)(user.id, 0, user.streakBest, tx);
                await (0, activityLog_repository_1.createActivityLog)({
                    user: { connect: { id: user.id } }, // Corrigido: usar 'user' com 'connect'
                    type: client_1.ActivityType.STREAK_UPDATED,
                    description: `Streak reset to 0 due to inactivity. Previous streak: ${user.streakCurrent}.`,
                }, tx);
                await (0, achievement_service_1.checkAndAwardAchievements)(user.id, tx); // Check for achievements after streak reset
            }
        });
    }
};
exports.checkAndResetDailyStreaks = checkAndResetDailyStreaks;
// This function could be called by a cron job daily
// Example:
// import cron from 'node-cron';
// cron.schedule('0 0 * * *', () => { // Every day at midnight
//   console.log('Running daily streak check...');
//   checkAndResetDailyStreaks().catch(console.error);
// });
