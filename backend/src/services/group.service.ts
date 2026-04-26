import { GroupRole, Role } from '@prisma/client';
import prisma from '../utils/prisma';
import { randomUUID } from 'crypto';

interface CreateGroupInput {
  name: string;
  description?: string;
  color?: string;
  logoUrl?: string;
  bannerUrl?: string;
  isRestricted?: boolean;
}

interface UpdateGroupInput {
  name?: string;
  description?: string;
  color?: string;
  logoUrl?: string;
  bannerUrl?: string;
  isRestricted?: boolean;
}

const groupInclude = {
  GroupMember: {
    include: {
      User: { select: { id: true, name: true, avatarUrl: true, avatarColor: true, connectaPoints: true } },
    },
  },
  Project: {
    select: {
      id: true,
      title: true,
      description: true,
      coverUrl: true,
      category: true,
      status: true,
      visibility: true,
      isJoiningOpen: true,
      leader: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { members: true, tasks: true } },
    },
  },
  _count: { select: { GroupMember: true, Project: true } },
} as const;

export const listGroups = async (userId?: string) => {
  const groups = await prisma.group.findMany({
    include: {
      _count: { select: { GroupMember: true, Project: true } },
      Project: { select: { likeCount: true } },
      GroupMember: { select: { userId: true } },
      ...(userId && { joinRequests: { where: { userId } } }),
    },
  });

  const withLikes = groups.map((g) => {
    const totalLikes = g.Project.reduce((sum, p) => sum + p.likeCount, 0);
    const { Project: _projects, ...rest } = g;
    return { ...rest, totalLikes };
  });

  withLikes.sort((a, b) => b.totalLikes - a.totalLikes);

  return withLikes;
};

export const getGroupDetails = async (id: string, userId?: string) => {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      ...groupInclude,
      ...(userId && { joinRequests: { where: { userId } } }),
    },
  });
  if (!group) throw { statusCode: 404, message: 'Group not found.' };
  return group;
};

export const createGroup = async (data: CreateGroupInput, creatorId: string) => {
  const existing = await prisma.group.findUnique({ where: { name: data.name } });
  if (existing) throw { statusCode: 409, message: 'Já existe um grupo com esse nome.' };

  return prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        id: randomUUID(),
        name: data.name,
        description: data.description,
        color: data.color || '#29B6F6',
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        isRestricted: data.isRestricted ?? false,
        GroupMember: {
          create: {
            userId: creatorId,
            role: GroupRole.ADMIN,
          },
        },
      },
      include: groupInclude,
    });
    return group;
  });
};

export const updateGroup = async (
  id: string,
  data: UpdateGroupInput,
  requestingUserId: string,
  requestingUserRole: Role
) => {
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: requestingUserId, groupId: id } },
  });
  const isGroupAdmin = membership?.role === GroupRole.ADMIN;
  const isSystemAdmin = requestingUserRole === Role.ADMIN;

  if (!isGroupAdmin && !isSystemAdmin) {
    throw { statusCode: 403, message: 'Apenas admins do grupo podem editá-lo.' };
  }

  return prisma.group.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.bannerUrl !== undefined && { bannerUrl: data.bannerUrl }),
      ...(data.isRestricted !== undefined && { isRestricted: data.isRestricted }),
      updatedAt: new Date(),
    },
    include: groupInclude,
  });
};

export const deleteGroup = async (
  id: string,
  requestingUserId: string,
  requestingUserRole: Role
) => {
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: requestingUserId, groupId: id } },
  });
  const isGroupAdmin = membership?.role === GroupRole.ADMIN;
  const isSystemAdmin = requestingUserRole === Role.ADMIN;

  if (!isGroupAdmin && !isSystemAdmin) {
    throw { statusCode: 403, message: 'Apenas admins do grupo podem excluí-lo.' };
  }

  return prisma.group.delete({ where: { id } });
};

export const joinGroup = async (groupId: string, userId: string) => {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw { statusCode: 404, message: 'Group not found.' };

  const existing = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (existing) throw { statusCode: 409, message: 'Você já é membro desse grupo.' };

  if (group.isRestricted) {
    throw { statusCode: 403, message: 'Este grupo é restrito. Você precisa solicitar entrada.' };
  }

  return prisma.groupMember.create({
    data: { userId, groupId, role: GroupRole.MEMBER },
  });
};

export const requestJoinGroup = async (groupId: string, userId: string) => {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw { statusCode: 404, message: 'Group not found.' };

  const existingMember = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (existingMember) throw { statusCode: 409, message: 'Você já é membro desse grupo.' };

  const existingRequest = await prisma.groupJoinRequest.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (existingRequest && existingRequest.status === 'PENDING') {
    throw { statusCode: 409, message: 'Você já tem uma solicitação pendente para este grupo.' };
  }

  if (existingRequest) {
    return prisma.groupJoinRequest.update({
      where: { userId_groupId: { userId, groupId } },
      data: { status: 'PENDING', updatedAt: new Date() },
    });
  }

  return prisma.groupJoinRequest.create({
    data: { userId, groupId },
  });
};

export const respondToJoinRequest = async (
  requestId: string,
  groupId: string,
  action: 'APPROVED' | 'REJECTED',
  requestingUserId: string,
  requestingUserRole: Role
) => {
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: requestingUserId, groupId } },
  });
  const isGroupAdmin = membership?.role === GroupRole.ADMIN;
  const isSystemAdmin = requestingUserRole === Role.ADMIN;

  if (!isGroupAdmin && !isSystemAdmin) {
    throw { statusCode: 403, message: 'Apenas admins do grupo podem gerenciar solicitações.' };
  }

  const joinRequest = await prisma.groupJoinRequest.findUnique({
    where: { id: requestId },
  });

  if (!joinRequest || joinRequest.groupId !== groupId) {
    throw { statusCode: 404, message: 'Solicitação não encontrada.' };
  }

  if (joinRequest.status !== 'PENDING') {
    throw { statusCode: 400, message: 'Esta solicitação já foi processada.' };
  }

  return prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.groupJoinRequest.update({
      where: { id: requestId },
      data: { status: action, updatedAt: new Date() },
    });

    if (action === 'APPROVED') {
      await tx.groupMember.create({
        data: {
          userId: joinRequest.userId,
          groupId: joinRequest.groupId,
          role: GroupRole.MEMBER,
        },
      });
    }

    return updatedRequest;
  });
};

export const leaveGroup = async (groupId: string, userId: string) => {
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });
  if (!membership) throw { statusCode: 404, message: 'Você não é membro desse grupo.' };

  if (membership.role === GroupRole.ADMIN) {
    const adminCount = await prisma.groupMember.count({
      where: { groupId, role: GroupRole.ADMIN },
    });
    if (adminCount <= 1) {
      throw {
        statusCode: 403,
        message: 'Você é o último admin. Promova outro membro antes de sair.',
      };
    }
  }

  return prisma.groupMember.delete({
    where: { userId_groupId: { userId, groupId } },
  });
};
