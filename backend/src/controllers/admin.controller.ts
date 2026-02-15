import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { getSystemOverview as getSystemOverviewService, adminUpdateProject, adminOverwriteConnectaPoints } from '../services/admin.service';
import { deleteUserProfile as deleteUserProfileService } from '../services/user.service';
import { getAllProjects as getAllProjectsService } from '../services/project.service';
import { findUsers, countUsers } from '../repositories/user.repository';
import prisma from '../utils/prisma';

export const getSystemOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const overview = await getSystemOverviewService();
        res.status(200).json(overview);
    } catch (error) {
        next(error);
    }
};

export const getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await getAllProjectsService(page, limit);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params;
        const adminId = (req as any).user.id;
        const updatedProject = await adminUpdateProject(projectId, req.body, adminId);
        res.status(200).json(updatedProject);
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = req.query.search as string;
        const all = req.query.all === 'true';

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            }
            : {};

        // Retorna todos os usuários
        if (all) {
            const users = await findUsers({
                where,
                orderBy: { createdAt: 'desc' }
            });

            return res.status(200).json({
                users,
                total: users.length,
                all: true
            });
        }

        // Paginação padrão
        const [users, total] = await Promise.all([
            findUsers({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' }
            }),
            countUsers(where)
        ]);

        res.status(200).json({ users, total, page, limit });
    } catch (error) {
        next(error);
    }
};

export const updateUserPoints = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { points, reason } = req.body;
        const adminId = (req as any).user.id;

        const updatedUser = await adminOverwriteConnectaPoints(userId, points, reason, adminId);
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
};

export const getAdminLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const search = req.query.search as string;
        const date = req.query.date as string;
        const all = req.query.all === 'true';

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const where: Prisma.ActivityLogWhereInput =
            search || date
                ? {
                    ...(date && {
                        createdAt: {
                            gte: new Date(`${date}T00:00:00.000Z`),
                            lte: new Date(`${date}T23:59:59.999Z`)
                        }
                    }),
                    ...(search && {
                        user: {
                            OR: [
                                {
                                    name: {
                                        contains: search,
                                        mode: 'insensitive'
                                    }
                                },
                                {
                                    email: {
                                        contains: search,
                                        mode: 'insensitive'
                                    }
                                }
                            ]
                        }
                    })
                }
                : {};

        // 🔹 Retorna TODOS os logs
        if (all) {
            const logs = await prisma.activityLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });

            return res.status(200).json({
                logs,
                total: logs.length,
                all: true
            });
        }

        // 🔹 Paginação padrão
        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.activityLog.count({ where })
        ]);

        res.status(200).json({ logs, total, page, limit });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const adminId = (req as any).user.id;

        const deletedUser = await deleteUserProfileService(userId, adminId);
        res.status(200).json(deletedUser);
    } catch (error) {
        next(error);
    }
};
