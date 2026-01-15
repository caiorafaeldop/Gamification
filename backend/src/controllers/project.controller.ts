import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { Role, TaskStatus } from '@prisma/client';

import { createNewProject, addMemberToProject } from '../services/project.service';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                members: true,
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
        const { name, description, category, coverUrl } = req.body;
        const userId = req.user!.userId;

        const project = await createNewProject({
            title: name,
            description,
            category,
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
            include: { members: { include: { user: { select: { id: true, name: true, avatarColor: true } } } } }
        });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        next(error);
    }
}
