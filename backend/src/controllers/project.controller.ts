import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { Role, TaskStatus } from '@prisma/client';

import { createNewProject, addMemberToProject, leaveProject as leaveProjectService, transferProjectOwnership, deleteProjectById, registerInterestInProject, requestJoinProject, listProjectJoinRequests, respondToProjectJoinRequest } from '../services/project.service';
import { getCatalogForUser } from '../services/catalog.service';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                status: {
                    not: 'archived'
                }
            },
            include: {
                members: true,
                leader: { select: { name: true } },
                tasks: { select: { status: true } }, // To calculate progress
            },
        });

        const formattedProjects = projects.map(p => {
            const totalTasks = p.tasks.length;
            const completedTasks = p.tasks.filter(t => t.status === TaskStatus.done).length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            return {
                ...p,
                progress
            };
        });

        res.json(formattedProjects);
    } catch (error) {
        next(error);
    }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('[CONTROLLER] createProject hit');
        const { title, name, description, category, type, coverUrl, visibility, groupId } = req.body;
        const userId = req.user!.userId;

        const project = await createNewProject({
            title: title || name,
            description,
            category,
            type,
            coverUrl,
            visibility,
            groupId: groupId || undefined,
            leaderId: userId,
            memberIds: [userId]
        } as any, userId);

        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
};

export const uploadProjectCover = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({ url: req.file.path });
    } catch (error) {
        next(error);
    }
};

export const joinProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        console.log(`[CONTROLLER] joinProject hit for id: ${id}`);
        const userId = req.user!.userId;
        const userRole = req.user!.role;

        await addMemberToProject(id, { userId }, userId, userRole);

        res.json({ message: 'Joined successfully' });
    } catch (error) {
        next(error);
    }
};

export const getProjectDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                members: { include: { user: { select: { id: true, name: true, avatarColor: true, avatarUrl: true } } } },
                leader: { select: { id: true, name: true, avatarColor: true, avatarUrl: true } },
                tasks: { select: { status: true } },
                activityLogs: { select: { userId: true, pointsChange: true }, where: { pointsChange: { not: null } } },
                Group: { select: { id: true, name: true, logoUrl: true, color: true } }
            }
        });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        let liked = false;
        if (userId) {
            const likeRecord = await prisma.projectLike.findUnique({
                where: { userId_projectId: { userId, projectId: id } },
            });
            liked = !!likeRecord;
        }

        const membersWithScores = project.members.map((member: any) => {
            const memberLogs = project.activityLogs.filter((log: any) => log.userId === member.userId);
            const projectScore = memberLogs.reduce((sum: number, log: any) => sum + (log.pointsChange || 0), 0);
            return {
                ...member,
                projectScore
            };
        });
        
        membersWithScores.sort((a: any, b: any) => b.projectScore - a.projectScore);

        const projectTotalPoints = project.activityLogs.reduce((sum: number, log: any) => sum + (log.pointsChange || 0), 0);
        const tasksCount = project.tasks.length;
        const tasksCompleted = project.tasks.filter((t: any) => t.status === TaskStatus.done).length;

        const formattedProject = {
            ...project,
            members: membersWithScores,
            likeCount: project.likeCount,
            liked,
            stats: {
                tasksCount,
                tasksCompleted,
                totalPoints: projectTotalPoints
            }
        };
        
        delete (formattedProject as any).activityLogs;

        res.json(formattedProject);
    } catch (error) {
        next(error);
    }
}
export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, name, description, category, coverUrl, status, color, xpReward, pointsPerOpenTask, pointsPerCompletedTask } = req.body;
        const userId = (req as any).user?.userId;



        // Check if user is leader or admin
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) {
            console.error(`[UPDATE PROJECT] Project ${id} not found`);
            return res.status(404).json({ message: 'Projeto não encontrado' });
        }

        /* Permissão removida conforme solicitação: qualquer usuário autenticado pode editar */
        // if (project.leaderId !== userId && (req as any).user?.role !== Role.ADMIN) {
        //     console.error(`[UPDATE PROJECT] Permission denied for user ${userId} on project ${id}`);
        //     return res.status(403).json({ message: 'Apenas o líder do projeto ou um administrador podem alterar os detalhes.' });
        // }

        const data: any = {};
        if (title !== undefined) data.title = title;
        if (name !== undefined) data.title = name; // Compatibility with frontend using 'name'
        if (description !== undefined) data.description = description;
        if (category !== undefined) data.category = category;
        if (coverUrl !== undefined) data.coverUrl = coverUrl;
        if (status !== undefined) data.status = status;
        if (color !== undefined) data.color = color;
        if (xpReward !== undefined) data.xpReward = xpReward;
        if (pointsPerOpenTask !== undefined) data.pointsPerOpenTask = pointsPerOpenTask;
        if (pointsPerCompletedTask !== undefined) data.pointsPerCompletedTask = pointsPerCompletedTask;
        if (req.body.visibility !== undefined) data.visibility = req.body.visibility;
        if (req.body.groupId !== undefined) {
            data.Group = req.body.groupId
                ? { connect: { id: req.body.groupId } }
                : { disconnect: true };
        }

        console.log(`[UPDATE PROJECT] Updating project ${id} with data:`, data);

        const updatedProject = await prisma.project.update({
            where: { id },
            data
        });

        res.json(updatedProject);
    } catch (error: any) {
        console.error(`[UPDATE PROJECT ERROR]:`, error);
        next(error);
    }
};

export const leaveProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;

        await leaveProjectService(id, userId);

        res.json({ message: 'Você saiu do projeto com sucesso.' });
    } catch (error) {
        next(error);
    }
};

export const transferOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { newLeaderId } = req.body;
        const userId = req.user!.userId;

        const updatedProject = await transferProjectOwnership(id, newLeaderId, userId);

        res.json(updatedProject);
    } catch (error) {
        next(error);
    }
};

export const getExploreProjects = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                status: { not: 'archived' },
                visibility: { in: ['PUBLIC_VIEW', 'PUBLIC_LIKE', 'PUBLIC_OPEN'] },
            },
            include: {
                members: { select: { userId: true } },
                leader: { select: { id: true, name: true, avatarUrl: true, avatarColor: true } },
                Group: { select: { id: true, name: true, color: true, logoUrl: true } },
                tasks: { select: { status: true } },
                _count: { select: { members: true, tasks: true } },
            },
            orderBy: [
                { isJoiningOpen: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        const formatted = projects.map((p: any) => {
            const totalTasks = p.tasks.length;
            const completedTasks = p.tasks.filter((t: any) => t.status === TaskStatus.done).length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            const { tasks, ...rest } = p;
            return { ...rest, progress };
        });

        res.json(formatted);
    } catch (error) {
        next(error);
    }
};

export const getCatalog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const catalog = await getCatalogForUser(userId);
        res.json(catalog);
    } catch (error) {
        next(error);
    }
};

export const registerInterest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;
        const result = await registerInterestInProject(id, userId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const requestJoinProjectController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;
        const result = await requestJoinProject(id, userId);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const listProjectJoinRequestsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;
        const result = await listProjectJoinRequests(id, userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const respondToProjectJoinRequestController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;
        const { action } = req.body;
        const userId = req.user!.userId;
        if (action !== 'APPROVED' && action !== 'REJECTED') {
            return res.status(400).json({ message: "action deve ser 'APPROVED' ou 'REJECTED'." });
        }
        const result = await respondToProjectJoinRequest(requestId, action, userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;
        const userRole = req.user!.role;

        // Note: deleteProjectById in service only checks for ADMIN by default or takes adminId as param.
        // We need to ensure leaders can also delete. 
        // Let's check project.service.ts deleteProjectById implementation again.

        const deletedProject = await deleteProjectById(id, userId);
        res.json(deletedProject);
    } catch (error) {
        next(error);
    }
};

