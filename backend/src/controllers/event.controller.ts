import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { EventType } from '@prisma/client';

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: 'asc' },
            include: {
                createdBy: {
                    select: { id: true, name: true, avatarColor: true }
                }
            }
        });
        res.json(events);
    } catch (error) {
        next(error);
    }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, type, date, time, location, description } = req.body;
        const userId = (req as any).user?.userId;

        if (!title || !type || !date || !time) {
            return res.status(400).json({ message: 'Título, tipo, data e horário são obrigatórios.' });
        }

        // Validate event type
        if (!Object.values(EventType).includes(type)) {
            return res.status(400).json({ message: 'Tipo de evento inválido.' });
        }

        const event = await prisma.event.create({
            data: {
                title,
                type: type as EventType,
                date: new Date(date),
                time,
                location,
                description,
                createdById: userId,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, avatarColor: true }
                }
            }
        });

        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, avatarColor: true }
                }
            }
        });

        if (!event) {
            return res.status(404).json({ message: 'Evento não encontrado.' });
        }

        res.json(event);
    } catch (error) {
        next(error);
    }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.userId;
        const userRole = (req as any).user?.role;

        const event = await prisma.event.findUnique({
            where: { id }
        });

        if (!event) {
            return res.status(404).json({ message: 'Evento não encontrado.' });
        }

        // Only creator or admin can delete
        if (event.createdById !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Você não tem permissão para excluir este evento.' });
        }

        await prisma.event.delete({
            where: { id }
        });

        res.json({ message: 'Evento excluído com sucesso.' });
    } catch (error) {
        next(error);
    }
};
