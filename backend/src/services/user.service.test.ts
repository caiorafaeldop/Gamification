import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivityType, TaskStatus } from '@prisma/client';
import { getMyProfile, getUserProfile } from './user.service';
import prisma from '../utils/prisma';

vi.mock('../utils/prisma', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
    },
    $queryRawUnsafe: vi.fn(),
  };
  return { default: mockPrisma };
});

const mockPrisma = prisma as any;

const buildUser = (connectaPoints: number) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  passwordHash: 'hashed',
  connectaPoints,
  tierId: 'tier-1',
  tier: { id: 'tier-1', name: 'Bronze', minPoints: 0, order: 1 },
  memberOfProjects: [],
  assignedTasks: [],
  bio: 'bio',
  skills: [],
  avatarUrl: null,
  streakCurrent: 0,
  streakBest: 0,
  lastActivityAt: null,
  role: 'MEMBER',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  avatarColor: null,
  course: null,
  contactEmail: null,
  linkedinUrl: null,
  githubUrl: null,
});

describe('getMyProfile level computation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return level 1 for a user with 0 points', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(buildUser(0));
    const profile = await getMyProfile('user-1');
    expect(profile.level).toBe(1);
  });

  it('should return level 1 for a user with 999 points', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(buildUser(999));
    const profile = await getMyProfile('user-1');
    expect(profile.level).toBe(1);
  });

  it('should return level 2 for a user with exactly 1000 points', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(buildUser(1000));
    const profile = await getMyProfile('user-1');
    expect(profile.level).toBe(2);
  });

  it('should return level 5 for a user with 4150 points', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(buildUser(4150));
    const profile = await getMyProfile('user-1');
    expect(profile.level).toBe(5);
  });

  it('should not expose passwordHash', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(buildUser(100));
    const profile = await getMyProfile('user-1');
    expect((profile as any).passwordHash).toBeUndefined();
  });
});

describe('getUserProfile level computation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return level 1 for a user with 500 points', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(buildUser(500));
    const profile = await getUserProfile('user-1');
    expect(profile.level).toBe(1);
  });

  it('should return level 3 for a user with 2500 points', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(buildUser(2500));
    const profile = await getUserProfile('user-1');
    expect(profile.level).toBe(3);
  });

  it('should not expose passwordHash', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(buildUser(100));
    const profile = await getUserProfile('user-1');
    expect((profile as any).passwordHash).toBeUndefined();
  });
});
