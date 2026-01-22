import prisma from '../utils/prisma';
import { Prisma, User, Role } from '@prisma/client';

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  });
};

export const findUserByName = async (name: string): Promise<User | null> => {
  return prisma.user.findFirst({ where: { name } });
};

export const findUserById = async (id: string, transaction?: Prisma.TransactionClient): Promise<User | null> => {
  const client = transaction || prisma;
  return client.user.findUnique({ where: { id } });
};

export const createUser = async (data: Prisma.UserCreateInput, transaction?: Prisma.TransactionClient): Promise<User> => {
  const client = transaction || prisma;
  return client.user.create({ data });
};

// Atualizado para aceitar um cliente de transação
export const updateUser = async (id: string, data: Prisma.UserUpdateInput, transaction?: Prisma.TransactionClient): Promise<User> => {
  const client = transaction || prisma;
  return client.user.update({ where: { id }, data });
};

export const findUsers = async (params: {
  skip?: number;
  take?: number;
  cursor?: Prisma.UserWhereUniqueInput;
  where?: Prisma.UserWhereInput;
  orderBy?: Prisma.UserOrderByWithRelationInput;
}, transaction?: Prisma.TransactionClient): Promise<User[]> => {
  const client = transaction || prisma;
  const { skip, take, cursor, where, orderBy } = params;
  return client.user.findMany({
    skip,
    take,
    cursor,
    where,
    orderBy,
    include: { tier: true },
  });
};

export const countUsers = async (where?: Prisma.UserWhereInput): Promise<number> => {
  return prisma.user.count({ where });
};

export const updateConnectaPoints = async (userId: string, points: number, transaction?: Prisma.TransactionClient): Promise<User> => {
  const client = transaction || prisma;
  return client.user.update({
    where: { id: userId },
    data: { connectaPoints: { increment: points } },
  });
};

export const updateStreak = async (userId: string, currentStreak: number, bestStreak: number, transaction?: Prisma.TransactionClient): Promise<User> => {
  const client = transaction || prisma;
  return client.user.update({
    where: { id: userId },
    data: {
      streakCurrent: currentStreak,
      streakBest: bestStreak,
      lastActivityAt: new Date(),
    },
  });
};

export const updateUserTier = async (userId: string, tierId: string, transaction?: Prisma.TransactionClient): Promise<User> => {
  const client = transaction || prisma;
  return client.user.update({
    where: { id: userId },
    data: { tierId },
  });
};

export const updateLastActivity = async (userId: string, transaction?: Prisma.TransactionClient): Promise<User> => {
  const client = transaction || prisma;
  return client.user.update({
    where: { id: userId },
    data: { lastActivityAt: new Date() },
  });
};

export const updateManyUsers = async (where: Prisma.UserWhereInput, data: Prisma.UserUpdateInput) => {
  return prisma.user.updateMany({ where, data });
};