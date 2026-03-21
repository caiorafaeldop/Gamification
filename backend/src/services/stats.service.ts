import prisma from '../utils/prisma';

export const getSystemOverview = async () => {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, isActive: true, avatarColor: true, avatarUrl: true, linkedinUrl: true, githubUrl: true },
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

export const getPublicProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            course: true,
            bio: true,
            skills: true,
            connectaPoints: true,
            avatarUrl: true,
            contactEmail: true,
            linkedinUrl: true,
            githubUrl: true,
            tier: { select: { name: true } },
            userAchievements: {
                select: {
                    achievement: { select: { id: true, name: true, icon: true, color: true } }
                }
            },
            memberOfProjects: {
                select: {
                    project: { 
                        select: { 
                            id: true, 
                            title: true, 
                            description: true, 
                            category: true, 
                            progress: true,
                            tasks: {
                                where: {
                                    status: 'done',
                                    assignees: {
                                        some: {
                                            userId: userId
                                        }
                                    }
                                },
                                select: { id: true }
                            }
                        } 
                    }
                }
            }
        }
    });

    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    return user;
};
