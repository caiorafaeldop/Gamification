import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { Role, TaskStatus } from '@prisma/client';

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
        const { name, description, category, coverUrl } = req.body;
        const userId = (req as any).user?.userId;

        const project = await prisma.project.create({
            data: {
                title: name,
                description,
                category,
                coverUrl,
                leaderId: userId,
                members: {
                    create: { userId: userId } // Add creator as member
                }
            }
        });
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
        const userId = (req as any).user?.userId;

        // Check if already member
        const existing = await prisma.projectMember.findFirst({
            where: { projectId: id, userId }
        });

        if (existing) {
             return res.status(400).json({ message: 'Already a member' });
        }

        await prisma.projectMember.create({
            data: {
                projectId: id,
                userId
            }
        });

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
             include: { members: { include: { user: { select: { id: true, name: true, avatarColor: true }} } } }
        });
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        next(error);
    }
}
