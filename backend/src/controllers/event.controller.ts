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
                },
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, avatarColor: true }
                        }
                    }
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
                participants: {
                    create: {
                        userId: userId
                    }
                }
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

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, type, date, time, location, description } = req.body;
        const userId = (req as any).user?.userId;
        const userRole = (req as any).user?.role;

        const event = await prisma.event.findUnique({
            where: { id }
        });

        if (!event) {
            return res.status(404).json({ message: 'Evento não encontrado.' });
        }

        // Only creator or admin can update
        if (event.createdById !== userId && userRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Você não tem permissão para editar este evento.' });
        }

        // Validate event type if provided
        if (type && !Object.values(EventType).includes(type)) {
            return res.status(400).json({ message: 'Tipo de evento inválido.' });
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(type && { type: type as EventType }),
                ...(date && { date: new Date(date) }),
                ...(time && { time }),
                ...(location !== undefined && { location }),
                ...(description !== undefined && { description }),
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, avatarColor: true }
                },
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, avatarColor: true }
                        }
                    }
                }
            }
        });

        res.json(updatedEvent);
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

        // First delete all participants to avoid foreign key constraint
        await prisma.eventParticipant.deleteMany({
            where: { eventId: id }
        });

        // Then delete the event
        await prisma.event.delete({
            where: { id }
        });

        res.json({ message: 'Evento excluído com sucesso.' });
    } catch (error) {
        next(error);
    }
};

export const joinEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.userId;

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id }
        });

        if (!event) {
            return res.status(404).json({ message: 'Evento não encontrado.' });
        }

        // Check if already participating
        const existing = await prisma.eventParticipant.findUnique({
            where: {
                userId_eventId: { userId, eventId: id }
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Você já está participando deste evento.' });
        }

        await prisma.eventParticipant.create({
            data: {
                userId,
                eventId: id
            }
        });

        res.json({ message: 'Participação confirmada com sucesso!' });
    } catch (error) {
        next(error);
    }
};

export const leaveEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.userId;

        // Check if participating
        const existing = await prisma.eventParticipant.findUnique({
            where: {
                userId_eventId: { userId, eventId: id }
            }
        });

        if (!existing) {
            return res.status(400).json({ message: 'Você não está participando deste evento.' });
        }

        await prisma.eventParticipant.delete({
            where: {
                userId_eventId: { userId, eventId: id }
            }
        });

        res.json({ message: 'Participação cancelada.' });
    } catch (error) {
        next(error);
    }
};
