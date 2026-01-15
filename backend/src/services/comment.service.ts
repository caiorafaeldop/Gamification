import prisma from '../utils/prisma';

export const createComment = async (taskId: string, userId: string, content: string) => {
    return prisma.comment.create({
        data: {
            taskId,
            userId,
            content
        },
        include: {
            user: {
                select: { id: true, name: true, avatarUrl: true }
            }
        }
    });
};

export const getTaskComments = async (taskId: string) => {
    return prisma.comment.findMany({
        where: { taskId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { id: true, name: true, avatarUrl: true }
            }
        }
    });
};

export const deleteComment = async (commentId: string) => {
    return prisma.comment.delete({
        where: { id: commentId }
    });
};
