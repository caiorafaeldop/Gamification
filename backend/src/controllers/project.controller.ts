import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { Role, TaskStatus } from '@prisma/client';

import { createNewProject, addMemberToProject, leaveProject as leaveProjectService, transferProjectOwnership, deleteProjectById } from '../services/project.service';

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
        const { name, description, category, type, coverUrl } = req.body;
        const userId = req.user!.userId;

        const project = await createNewProject({
            title: name,
            description,
            category,
            type,
            coverUrl,
            leaderId: userId,
            memberIds: [userId]
        }, userId);

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
        const project = await prisma.project.findUnique({
            where: { id },

            include: {
                members: { include: { user: { select: { id: true, name: true, avatarColor: true } } } },
                leader: { select: { id: true, name: true, avatarColor: true } }
            }
        });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
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

