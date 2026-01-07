import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient, Role, TaskStatus, ActivityType } from '@prisma/client';
import { addPointsForTaskCompletion, recalcUserTier, updateStreakForUser } from './gamification.service';
import prisma from '../utils/prisma'; // Import the actual prisma client

// Mock Prisma client for isolated testing
vi.mock('../utils/prisma', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    tier: {
      findMany: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(mockPrisma)),
  };
  return mockPrisma;
});

const mockPrisma = prisma as any;

describe('Gamification Service', () => {
  let userId: string;
  let noviceTierId: string;
  let aspirantTierId: string;
  let leaderTierId: string;

  beforeEach(async () => {
    userId = 'test-user-id';
    noviceTierId = 'novice-tier-id';
    aspirantTierId = 'aspirant-tier-id';
    leaderTierId = 'leader-tier-id';

    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock initial tiers
    mockPrisma.tier.findMany.mockResolvedValue([
      { id: noviceTierId, name: 'Novice', minPoints: 0, order: 1, icon: '👋' },
      { id: aspirantTierId, name: 'Aspirant', minPoints: 100, order: 2, icon: '🌱' },
      { id: leaderTierId, name: 'Leader', minPoints: 600, order: 4, icon: '🌟' },
    ]);
  });

  describe('addPointsForTaskCompletion', () => {
    it('should add points, log activity, and recalculate tier', async () => {
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

      const result = await addPointsForTaskCompletion(userId, 20, 'task-id', mockPrisma);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { connectaPoints: { increment: 20 } },
      });
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          userId: userId,
          type: ActivityType.TASK_COMPLETED,
          description: 'Completed a task and earned 20 Connecta Points.',
          pointsChange: 20,
        },
      });
      expect(mockPrisma.user.update).not.toHaveBeenCalledWith({
        where: { id: userId },
        data: { tierId: expect.any(String) },
      }); // Tier doesn't change from 50 to 70
      expect(result).toEqual(updatedUser);
    });

    it('should update tier if points cross a threshold', async () => {
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

      await addPointsForTaskCompletion(userId, 20, 'task-id', mockPrisma);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { tierId: aspirantTierId },
      });
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          userId: userId,
          type: ActivityType.TIER_ACHIEVED,
          description: 'Achieved new tier: Aspirant!',
        },
      });
    });
  });

  describe('recalcUserTier', () => {
    it('should update user tier if points exceed current tier minPoints', async () => {
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

      const newTier = await recalcUserTier(userId, mockPrisma);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { tierId: aspirantTierId },
      });
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          userId: userId,
          type: ActivityType.TIER_ACHIEVED,
          description: 'Achieved new tier: Aspirant!',
        },
      });
      expect(newTier?.name).toBe('Aspirant');
    });

    it('should not update tier if points are within current tier range', async () => {
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

      const newTier = await recalcUserTier(userId, mockPrisma);

      expect(mockPrisma.user.update).not.toHaveBeenCalledWith({
        where: { id: userId },
        data: { tierId: expect.any(String) },
      });
      expect(mockPrisma.activityLog.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: ActivityType.TIER_ACHIEVED })
      );
      expect(newTier?.name).toBe('Novice');
    });
  });

  describe('updateStreakForUser', () => {
    it('should increment streak if last activity was yesterday', async () => {
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

      await updateStreakForUser(userId, mockPrisma);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          streakCurrent: 3,
          streakBest: 5,
          lastActivityAt: expect.any(Date),
        },
      });
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          userId: userId,
          type: ActivityType.STREAK_UPDATED,
          description: 'Streak updated: Current 3, Best 5.',
        },
      });
    });

    it('should reset streak if there was a gap day', async () => {
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

      await updateStreakForUser(userId, mockPrisma);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          streakCurrent: 1,
          streakBest: 5,
          lastActivityAt: expect.any(Date),
        },
      });
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          userId: userId,
          type: ActivityType.STREAK_UPDATED,
          description: 'Streak updated: Current 1, Best 5.',
        },
      });
    });

    it('should update streakBest if current streak exceeds it', async () => {
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

      await updateStreakForUser(userId, mockPrisma);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          streakCurrent: 6,
          streakBest: 6,
          lastActivityAt: expect.any(Date),
        },
      });
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          userId: userId,
          type: ActivityType.STREAK_UPDATED,
          description: 'Streak updated: Current 6, Best 6.',
        },
      });
    });

    it('should not change streak if activity already today', async () => {
      const today = new Date();
      const user = {
        id: userId,
        streakCurrent: 5,
        streakBest: 5,
        lastActivityAt: today,
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      await updateStreakForUser(userId, mockPrisma);

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockPrisma.activityLog.create).not.toHaveBeenCalled();
    });
  });
});