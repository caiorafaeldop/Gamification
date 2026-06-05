import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from '@prisma/client';
import prisma from '../utils/prisma';
import { isUserProjectMember } from '../repositories/project.repository';
import {
  createProjectVersion,
  deleteProjectVersion,
  listProjectVersions,
} from './projectVersion.service';

vi.mock('../utils/prisma', () => {
  const mockPrisma = {
    project: { findUnique: vi.fn() },
    projectVersion: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    task: { updateMany: vi.fn() },
    $transaction: vi.fn(async (callback: any) => callback(mockPrisma)),
  };
  return { default: mockPrisma };
});

vi.mock('../repositories/project.repository', () => ({
  isUserProjectMember: vi.fn(),
}));

const mockPrisma = prisma as any;
const mockIsUserProjectMember = isUserProjectMember as any;

const project = {
  id: 'project-1',
  title: 'Connecta Hub',
  leaderId: 'leader-1',
  visibility: 'PRIVATE',
};

describe('projectVersion.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.project.findUnique.mockResolvedValue(project);
    mockIsUserProjectMember.mockResolvedValue(false);
  });

  it('allows the project leader to create a version', async () => {
    mockPrisma.projectVersion.create.mockResolvedValue({ id: 'version-1', name: 'v1.0' });

    const result = await createProjectVersion(
      'project-1',
      { name: 'v1.0', status: 'PLANNED' },
      'leader-1',
      Role.LEADER,
    );

    expect(result).toEqual({ id: 'version-1', name: 'v1.0' });
    expect(mockPrisma.projectVersion.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'v1.0',
        projectId: 'project-1',
      }),
    });
  });

  it('blocks regular members from creating versions', async () => {
    await expect(
      createProjectVersion(
        'project-1',
        { name: 'v1.0', status: 'PLANNED' },
        'member-1',
        Role.MEMBER,
      ),
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(mockPrisma.projectVersion.create).not.toHaveBeenCalled();
  });

  it('lets project members list private project versions', async () => {
    mockIsUserProjectMember.mockResolvedValue(true);
    mockPrisma.projectVersion.findMany.mockResolvedValue([{ id: 'version-1', name: 'v1.0' }]);

    const result = await listProjectVersions('project-1', 'member-1', Role.MEMBER);

    expect(result).toHaveLength(1);
    expect(mockPrisma.projectVersion.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { projectId: 'project-1' },
    }));
  });

  it('disconnects tasks before deleting a version', async () => {
    mockPrisma.projectVersion.findFirst.mockResolvedValue({ id: 'version-1', projectId: 'project-1' });
    mockPrisma.projectVersion.delete.mockResolvedValue({ id: 'version-1' });

    await deleteProjectVersion('project-1', 'version-1', 'leader-1', Role.LEADER);

    expect(mockPrisma.task.updateMany).toHaveBeenCalledWith({
      where: { projectId: 'project-1', versionId: 'version-1' },
      data: { versionId: null },
    });
    expect(mockPrisma.projectVersion.delete).toHaveBeenCalledWith({
      where: { id: 'version-1' },
    });
  });
});
