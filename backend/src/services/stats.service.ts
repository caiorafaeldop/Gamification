import prisma from '../utils/prisma';

export const getSystemOverview = async () => {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, isActive: true, avatarColor: true, avatarUrl: true },
        orderBy: { name: 'asc' }
    });
    const projects = await prisma.project.findMany({
        select: { id: true, title: true, description: true, status: true, type: true, coverUrl: true, leader: { select: { name: true } } },
        orderBy: { title: 'asc' }
    });
    const events = await prisma.event.findMany({
        select: { id: true, title: true, description: true, date: true, time: true, type: true },
        orderBy: { title: 'asc' }
    });

    return {
        users, projects, events
    };
};
