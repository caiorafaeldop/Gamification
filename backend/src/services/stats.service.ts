import prisma from '../utils/prisma';

export const getSystemOverview = async () => {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, isActive: true, avatarColor: true }
    });
    const projects = await prisma.project.findMany({
        select: { id: true, title: true, status: true, coverUrl: true, leader: { select: { name: true } } }
    });
    const events = await prisma.event.findMany({
        select: { id: true, title: true, date: true, time: true, type: true }
    });

    return {
        users, projects, events
    };
};
