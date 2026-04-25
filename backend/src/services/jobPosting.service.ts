import { JobPostingStatus } from '@prisma/client';
import prisma from '../utils/prisma';

interface CreateJobPostingInput {
  title: string;
  description: string;
  contact: string;
  groupId?: string | null;
}

interface UpdateJobPostingInput {
  title?: string;
  description?: string;
  contact?: string;
  groupId?: string | null;
  status?: JobPostingStatus;
}

export const createJobPosting = async (authorId: string, data: CreateJobPostingInput) => {
  if (!data.title?.trim() || !data.description?.trim() || !data.contact?.trim()) {
    throw { statusCode: 400, message: 'Título, descrição e contato são obrigatórios.' };
  }

  if (data.groupId) {
    const membership = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: authorId, groupId: data.groupId } },
    });
    if (!membership) {
      throw { statusCode: 403, message: 'Você só pode publicar vagas vinculadas a grupos dos quais é membro.' };
    }
  }

  return prisma.jobPosting.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      contact: data.contact.trim(),
      groupId: data.groupId ?? null,
      authorId,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, avatarColor: true } },
      group: { select: { id: true, name: true, logoUrl: true, color: true } },
    },
  });
};

export const listJobPostings = async (filters: {
  status?: JobPostingStatus;
  groupId?: string;
  authorId?: string;
}) => {
  return prisma.jobPosting.findMany({
    where: {
      status: filters.status,
      groupId: filters.groupId,
      authorId: filters.authorId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, avatarColor: true } },
      group: { select: { id: true, name: true, logoUrl: true, color: true } },
    },
  });
};

export const getJobPostingById = async (id: string) => {
  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, avatarColor: true } },
      group: { select: { id: true, name: true, logoUrl: true, color: true } },
    },
  });
  if (!job) {
    throw { statusCode: 404, message: 'Vaga não encontrada.' };
  }
  return job;
};

export const updateJobPosting = async (id: string, requesterId: string, data: UpdateJobPostingInput) => {
  const existing = await prisma.jobPosting.findUnique({ where: { id } });
  if (!existing) {
    throw { statusCode: 404, message: 'Vaga não encontrada.' };
  }
  if (existing.authorId !== requesterId) {
    throw { statusCode: 403, message: 'Apenas o autor pode editar esta vaga.' };
  }

  if (data.groupId !== undefined && data.groupId !== null && data.groupId !== existing.groupId) {
    const membership = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: requesterId, groupId: data.groupId } },
    });
    if (!membership) {
      throw { statusCode: 403, message: 'Você só pode vincular a grupos dos quais é membro.' };
    }
  }

  return prisma.jobPosting.update({
    where: { id },
    data: {
      title: data.title?.trim(),
      description: data.description?.trim(),
      contact: data.contact?.trim(),
      groupId: data.groupId,
      status: data.status,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, avatarColor: true } },
      group: { select: { id: true, name: true, logoUrl: true, color: true } },
    },
  });
};

export const deleteJobPosting = async (id: string, requesterId: string) => {
  const existing = await prisma.jobPosting.findUnique({ where: { id } });
  if (!existing) {
    throw { statusCode: 404, message: 'Vaga não encontrada.' };
  }
  if (existing.authorId !== requesterId) {
    throw { statusCode: 403, message: 'Apenas o autor pode remover esta vaga.' };
  }
  await prisma.jobPosting.delete({ where: { id } });
  return { id };
};
