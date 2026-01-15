import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskStatus, ActivityType } from '@prisma/client';
import { checkAndAwardAchievements } from './achievement.service';
import { findAllAchievements, findUserAchievements, awardUserAchievement } from '../repositories/achievement.repository';
import { createActivityLog } from '../repositories/activityLog.repository';

vi.mock('../repositories/achievement.repository', () => ({
    findAllAchievements: vi.fn(),
    findUserAchievements: vi.fn(),
    awardUserAchievement: vi.fn(),
}));

vi.mock('../repositories/activityLog.repository', () => ({
    createActivityLog: vi.fn(),
}));

describe('Achievement Service - checkAndAwardAchievements', () => {
    const userId = 'user-1';
    let mockTransaction: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockTransaction = {
            user: {
                findUnique: vi.fn(),
            },
            activityLog: {
                aggregate: vi.fn(),
            },
        };
    });

    it('should award "Bem-vindo a bordo" when profile is completed', async () => {
        const achievement = { id: 'ach-1', name: 'Bem-vindo a bordo', criteria: 'profile_completed' };
        (findAllAchievements as any).mockResolvedValue([achievement]);
        (findUserAchievements as any).mockResolvedValue([]);

        mockTransaction.user.findUnique.mockResolvedValue({
            id: userId,
            avatarColor: '#FF0000',
            course: 'Engineering',
            _count: { assignedTasks: 0, memberOfProjects: 0, createdTasks: 0, leaderOfProjects: 0 },
            memberOfProjects: [],
            assignedTasks: []
        });
        mockTransaction.activityLog.aggregate.mockResolvedValue({ _sum: { pointsChange: 0 } });

        await checkAndAwardAchievements(userId, mockTransaction);

        expect(awardUserAchievement).toHaveBeenCalledWith(userId, achievement.id, mockTransaction);
    });

    it('should award "Primeira Classe" when a project is completed', async () => {
        const achievement = { id: 'ach-2', name: 'Primeira Classe', criteria: 'max_score_project' };
        (findAllAchievements as any).mockResolvedValue([achievement]);
        (findUserAchievements as any).mockResolvedValue([]);

        mockTransaction.user.findUnique.mockResolvedValue({
            id: userId,
            _count: { assignedTasks: 0, memberOfProjects: 1, createdTasks: 0, leaderOfProjects: 0 },
            memberOfProjects: [{ project: { progress: 100 } }],
            assignedTasks: []
        });
        mockTransaction.activityLog.aggregate.mockResolvedValue({ _sum: { pointsChange: 0 } });

        await checkAndAwardAchievements(userId, mockTransaction);

        expect(awardUserAchievement).toHaveBeenCalledWith(userId, achievement.id, mockTransaction);
    });

    it('should award "Super Produtivo" when weekly points threshold is met', async () => {
        const achievement = { id: 'ach-3', name: 'Super Produtivo', criteria: 'weekly_points >= 1000' };
        (findAllAchievements as any).mockResolvedValue([achievement]);
        (findUserAchievements as any).mockResolvedValue([]);

        mockTransaction.user.findUnique.mockResolvedValue({
            id: userId,
            _count: { assignedTasks: 0, memberOfProjects: 0, createdTasks: 0, leaderOfProjects: 0 },
            memberOfProjects: [],
            assignedTasks: []
        });
        mockTransaction.activityLog.aggregate.mockResolvedValue({ _sum: { pointsChange: 1200 } });

        await checkAndAwardAchievements(userId, mockTransaction);

        expect(awardUserAchievement).toHaveBeenCalledWith(userId, achievement.id, mockTransaction);
    });

    it('should award "Bug Hunter" when a task with tag "bug" is completed', async () => {
        const achievement = { id: 'ach-4', name: 'Bug Hunter', criteria: 'bug_report_validated' };
        (findAllAchievements as any).mockResolvedValue([achievement]);
        (findUserAchievements as any).mockResolvedValue([]);

        mockTransaction.user.findUnique.mockResolvedValue({
            id: userId,
            _count: { assignedTasks: 1, memberOfProjects: 0, createdTasks: 0, leaderOfProjects: 0 },
            memberOfProjects: [],
            assignedTasks: [{ id: 'task-1', tags: ['bug'] }]
        });
        mockTransaction.activityLog.aggregate.mockResolvedValue({ _sum: { pointsChange: 0 } });

        await checkAndAwardAchievements(userId, mockTransaction);

        expect(awardUserAchievement).toHaveBeenCalledWith(userId, achievement.id, mockTransaction);
    });
});
