import { KanbanColumn, Prisma } from "@prisma/client";
import prisma from "../utils/prisma";

export const createColumn = async (data: Prisma.KanbanColumnCreateInput) => {
    return prisma.kanbanColumn.create({
        data,
    });
};

export const findColumnsByProjectId = async (projectId: string) => {
    return prisma.kanbanColumn.findMany({
        where: { projectId },
        orderBy: { order: "asc" },
    });
};

export const findColumnById = async (id: string) => {
    return prisma.kanbanColumn.findUnique({
        where: { id },
    });
};

export const updateColumn = async (id: string, data: Prisma.KanbanColumnUpdateInput) => {
    return prisma.kanbanColumn.update({
        where: { id },
        data,
    });
};

export const deleteColumn = async (id: string) => {
    return prisma.kanbanColumn.delete({
        where: { id },
    });
};

export const countColumnsInProject = async (projectId: string) => {
    return prisma.kanbanColumn.count({
        where: { projectId },
    });
};
