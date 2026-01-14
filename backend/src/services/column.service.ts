import { createColumn, findColumnsByProjectId, findColumnById, updateColumn, deleteColumn, countColumnsInProject } from "../repositories/column.repository";
import { findProjectById } from "../repositories/project.repository";
import { updateTask } from "../repositories/task.repository";
import prisma from "../utils/prisma";

export const createNewColumn = async (projectId: string, title: string) => {
    const project = await findProjectById(projectId);
    if (!project) {
        throw { statusCode: 404, message: "Project not found" };
    }

    const order = await countColumnsInProject(projectId);

    return createColumn({
        title,
        order,
        project: { connect: { id: projectId } },
    });
};

export const updateColumnDetails = async (columnId: string, data: { title?: string; order?: number }) => {
    const column = await findColumnById(columnId);
    if (!column) {
        throw { statusCode: 404, message: "Column not found" };
    }

    return updateColumn(columnId, data);
};

export const removeColumn = async (columnId: string) => {
    const column = await prisma.kanbanColumn.findUnique({
        where: { id: columnId },
        include: { tasks: true },
    });

    if (!column) {
        throw { statusCode: 404, message: "Column not found" };
    }

    // If there are tasks, we need to handle them.
    // For now, let's forbid deletion if tasks exist, or move them to another column.
    // Let's try to move them to the first column that isn't this one.
    const otherColumns = await findColumnsByProjectId(column.projectId);
    const targetColumn = otherColumns.find((c) => c.id !== columnId);

    if (column.tasks.length > 0) {
        if (!targetColumn) {
            throw { statusCode: 400, message: "Cannot delete the last column when it contains tasks." };
        }

        // Move tasks
        await prisma.task.updateMany({
            where: { columnId },
            data: { columnId: targetColumn.id },
        });
    }

    return deleteColumn(columnId);
};

export const initializeProjectColumns = async (projectId: string) => {
    const defaults = ["A fazer", "Em progresso", "Concluído"];

    for (let i = 0; i < defaults.length; i++) {
        await createColumn({
            title: defaults[i],
            order: i,
            project: { connect: { id: projectId } },
        });
    }
};
