"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const client_1 = require("@prisma/client");
const gamification_service_1 = require("./gamification.service");
const prisma_1 = __importDefault(require("../utils/prisma")); // Import the actual prisma client
// Mock Prisma client for isolated testing
vitest_1.vi.mock('../utils/prisma', () => {
    const mockPrisma = {
        user: {
            findUnique: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
        },
        tier: {
            findMany: vitest_1.vi.fn(),
        },
        activityLog: {
            create: vitest_1.vi.fn(),
        },
        $transaction: vitest_1.vi.fn((callback) => callback(mockPrisma)),
    };
    return mockPrisma;
});
const mockPrisma = prisma_1.default;
(0, vitest_1.describe)('Gamification Service', () => {
    let userId;
    let noviceTierId;
    let aspirantTierId;
    let leaderTierId;
    (0, vitest_1.beforeEach)(async () => {
        userId = 'test-user-id';
        noviceTierId = 'novice-tier-id';
        aspirantTierId = 'aspirant-tier-id';
        leaderTierId = 'leader-tier-id';
        // Reset mocks before each test
        vitest_1.vi.clearAllMocks();
        // Mock initial tiers
        mockPrisma.tier.findMany.mockResolvedValue([
            { id: noviceTierId, name: 'Novice', minPoints: 0, order: 1, icon: '👋' },
            { id: aspirantTierId, name: 'Aspirant', minPoints: 100, order: 2, icon: '🌱' },
            { id: leaderTierId, name: 'Leader', minPoints: 600, order: 4, icon: '🌟' },
        ]);
    });
    (0, vitest_1.describe)('addPointsForTaskCompletion', () => {
        (0, vitest_1.it)('should add points, log activity, and recalculate tier', async () => {
            const initialUser = {
                id: userId,
                connectaPoints: 50,
                tierId: noviceTierId,
                tier: { id: noviceTierId, name: 'Novice', minPoints: 0, order: 1, icon: '👋' },
            };
            const updatedUser = {
                ...initialUser,
                connectaPoints: 70,
            };
            mockPrisma.user.findUnique.mockResolvedValueOnce(initialUser); // For recalcUserTier initial fetch
            mockPrisma.user.update.mockResolvedValueOnce(updatedUser); // For updateConnectaPoints
            mockPrisma.user.findUnique.mockResolvedValueOnce(updatedUser); // For recalcUserTier after points update
            mockPrisma.user.update.mockResolvedValueOnce(updatedUser); // For updateUserTier (if tier changes)
            const result = await (0, gamification_service_1.addPointsForTaskCompletion)(userId, 20, 'task-id', mockPrisma);
            (0, vitest_1.expect)(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { connectaPoints: { increment: 20 } },
            });
            (0, vitest_1.expect)(mockPrisma.activityLog.create).toHaveBeenCalledWith({
                data: {
                    userId: userId,
                    type: client_1.ActivityType.TASK_COMPLETED,
                    description: 'Completed a task and earned 20 Connecta Points.',
                    pointsChange: 20,
                },
            });
            (0, vitest_1.expect)(mockPrisma.user.update).not.toHaveBeenCalledWith({
                where: { id: userId },
                data: { tierId: vitest_1.expect.any(String) },
            }); // Tier doesn't change from 50 to 70
            (0, vitest_1.expect)(result).toEqual(updatedUser);
        });
        (0, vitest_1.it)('should update tier if points cross a threshold', async () => {
            const initialUser = {
                id: userId,
                connectaPoints: 90,
                tierId: noviceTierId,
                tier: { id: noviceTierId, name: 'Novice', minPoints: 0, order: 1, icon: '👋' },
            };
            const updatedUser = {
                ...initialUser,
                connectaPoints: 110,
                tierId: aspirantTierId,
                tier: { id: aspirantTierId, name: 'Aspirant', minPoints: 100, order: 2, icon: '🌱' },
            };
            mockPrisma.user.findUnique.mockResolvedValueOnce(initialUser); // For recalcUserTier initial fetch
            mockPrisma.user.update.mockResolvedValueOnce({ ...initialUser, connectaPoints: 110 }); // For updateConnectaPoints
            mockPrisma.user.findUnique.mockResolvedValueOnce({ ...initialUser, connectaPoints: 110 }); // For recalcUserTier after points update
            mockPrisma.user.update.mockResolvedValueOnce(updatedUser); // For updateUserTier
            mockPrisma.tier.findMany.mockResolvedValue([
                { id: noviceTierId, name: 'Novice', minPoints: 0, order: 1, icon: '👋' },
                { id: aspirantTierId, name: 'Aspirant', minPoints: 100, order: 2, icon: '🌱' },
            ]); // For findTierByPoints
            await (0, gamification_service_1.addPointsForTaskCompletion)(userId, 20, 'task-id', mockPrisma);
            (0, vitest_1.expect)(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { tierId: aspirantTierId },
            });
            (0, vitest_1.expect)(mockPrisma.activityLog.create).toHaveBeenCalledWith({
                data: {
                    userId: userId,
                    type: client_1.ActivityType.TIER_ACHIEVED,
                    description: 'Achieved new tier: Aspirant!',
                },
            });
        });
    });
    (0, vitest_1.describe)('recalcUserTier', () => {
        (0, vitest_1.it)('should update user tier if points exceed current tier minPoints', async () => {
            const user = {
                id: userId,
                connectaPoints: 150,
                tierId: noviceTierId,
                tier: { id: noviceTierId, name: 'Novice', minPoints: 0, order: 1, icon: '👋' },
            };
            mockPrisma.user.findUnique.mockResolvedValue(user);
            mockPrisma.tier.findMany.mockResolvedValue([
                { id: noviceTierId, name: 'Novice', minPoints: 0, order: 1, icon: '👋' },
                { id: aspirantTierId, name: 'Aspirant', minPoints: 100, order: 2, icon: '🌱' },
            ]);
            mockPrisma.user.update.mockResolvedValue({ ...user, tierId: aspirantTierId });
            const newTier = await (0, gamification_service_1.recalcUserTier)(userId, mockPrisma);
            (0, vitest_1.expect)(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { tierId: aspirantTierId },
            });
            (0, vitest_1.expect)(mockPrisma.activityLog.create).toHaveBeenCalledWith({
                data: {
                    userId: userId,
                    type: client_1.ActivityType.TIER_ACHIEVED,
                    description: 'Achieved new tier: Aspirant!',
                },
            });
            (0, vitest_1.expect)(newTier?.name).toBe('Aspirant');
        });
        (0, vitest_1.it)('should not update tier if points are within current tier range', async () => {
            const user = {
                id: userId,
                connectaPoints: 50,
                tierId: noviceTierId,
                tier: { id: noviceTierId, name: 'Novice', minPoints: 0, order: 1, icon: '👋' },
            };
            mockPrisma.user.findUnique.mockResolvedValue(user);
            mockPrisma.tier.findMany.mockResolvedValue([
                { id: noviceTierId, name: 'Novice', minPoints: 0, order: 1, icon: '👋' },
                { id: aspirantTierId, name: 'Aspirant', minPoints: 100, order: 2, icon: '🌱' },
            ]);
            const newTier = await (0, gamification_service_1.recalcUserTier)(userId, mockPrisma);
            (0, vitest_1.expect)(mockPrisma.user.update).not.toHaveBeenCalledWith({
                where: { id: userId },
                data: { tierId: vitest_1.expect.any(String) },
            });
            (0, vitest_1.expect)(mockPrisma.activityLog.create).not.toHaveBeenCalledWith(vitest_1.expect.objectContaining({ type: client_1.ActivityType.TIER_ACHIEVED }));
            (0, vitest_1.expect)(newTier?.name).toBe('Novice');
        });
    });
    (0, vitest_1.describe)('updateStreakForUser', () => {
        (0, vitest_1.it)('should increment streak if last activity was yesterday', async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const user = {
                id: userId,
                streakCurrent: 2,
                streakBest: 5,
                lastActivityAt: yesterday,
            };
            mockPrisma.user.findUnique.mockResolvedValue(user);
            mockPrisma.user.update.mockResolvedValue({ ...user, streakCurrent: 3 });
            await (0, gamification_service_1.updateStreakForUser)(userId, mockPrisma);
            (0, vitest_1.expect)(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    streakCurrent: 3,
                    streakBest: 5,
                    lastActivityAt: vitest_1.expect.any(Date),
                },
            });
            (0, vitest_1.expect)(mockPrisma.activityLog.create).toHaveBeenCalledWith({
                data: {
                    userId: userId,
                    type: client_1.ActivityType.STREAK_UPDATED,
                    description: 'Streak updated: Current 3, Best 5.',
                },
            });
        });
        (0, vitest_1.it)('should reset streak if there was a gap day', async () => {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const user = {
                id: userId,
                streakCurrent: 2,
                streakBest: 5,
                lastActivityAt: twoDaysAgo,
            };
            mockPrisma.user.findUnique.mockResolvedValue(user);
            mockPrisma.user.update.mockResolvedValue({ ...user, streakCurrent: 1 });
            await (0, gamification_service_1.updateStreakForUser)(userId, mockPrisma);
            (0, vitest_1.expect)(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    streakCurrent: 1,
                    streakBest: 5,
                    lastActivityAt: vitest_1.expect.any(Date),
                },
            });
            (0, vitest_1.expect)(mockPrisma.activityLog.create).toHaveBeenCalledWith({
                data: {
                    userId: userId,
                    type: client_1.ActivityType.STREAK_UPDATED,
                    description: 'Streak updated: Current 1, Best 5.',
                },
            });
        });
        (0, vitest_1.it)('should update streakBest if current streak exceeds it', async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const user = {
                id: userId,
                streakCurrent: 5,
                streakBest: 5,
                lastActivityAt: yesterday,
            };
            mockPrisma.user.findUnique.mockResolvedValue(user);
            mockPrisma.user.update.mockResolvedValue({ ...user, streakCurrent: 6, streakBest: 6 });
            await (0, gamification_service_1.updateStreakForUser)(userId, mockPrisma);
            (0, vitest_1.expect)(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    streakCurrent: 6,
                    streakBest: 6,
                    lastActivityAt: vitest_1.expect.any(Date),
                },
            });
            (0, vitest_1.expect)(mockPrisma.activityLog.create).toHaveBeenCalledWith({
                data: {
                    userId: userId,
                    type: client_1.ActivityType.STREAK_UPDATED,
                    description: 'Streak updated: Current 6, Best 6.',
                },
            });
        });
        (0, vitest_1.it)('should not change streak if activity already today', async () => {
            const today = new Date();
            const user = {
                id: userId,
                streakCurrent: 5,
                streakBest: 5,
                lastActivityAt: today,
            };
            mockPrisma.user.findUnique.mockResolvedValue(user);
            await (0, gamification_service_1.updateStreakForUser)(userId, mockPrisma);
            (0, vitest_1.expect)(mockPrisma.user.update).not.toHaveBeenCalled();
            (0, vitest_1.expect)(mockPrisma.activityLog.create).not.toHaveBeenCalled();
        });
    });
});
