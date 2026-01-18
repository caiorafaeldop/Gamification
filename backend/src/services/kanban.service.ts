import { TaskStatus } from '@prisma/client';
import prisma from '../utils/prisma';

export const getProjectBoard = async (projectId: string) => {
    let columns = await prisma.kanbanColumn.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
    });

    if (columns.length === 0) {
        columns = await createDefaultColumns(projectId);
    }

    const tasks = await prisma.task.findMany({
        where: { projectId },
        include: {
            assignedTo: { select: { id: true, name: true, avatarColor: true } },
            createdBy: { select: { id: true, name: true } },
        },
    });

    // Ensure all tasks have a columnId (migration for old tasks)
    for (const task of tasks.filter(t => !t.columnId)) {
        const matchingColumn = columns.find(c => c.status === task.status) || columns[0];
        await prisma.task.update({
            where: { id: task.id },
            data: { columnId: matchingColumn.id }
        });
        task.columnId = matchingColumn.id;
    }

    return columns.map(col => ({
        ...col,
        tasks: tasks.filter(t => t.columnId === col.id)
    }));
};

const createDefaultColumns = async (projectId: string) => {
    const defaultData = [
        { title: 'A Fazer', order: 0, status: TaskStatus.todo, projectId, isCompletionColumn: false },
        { title: 'Em Progresso', order: 1, status: TaskStatus.in_progress, projectId, isCompletionColumn: false },
        { title: 'Conclusão', order: 2, status: TaskStatus.done, projectId, isCompletionColumn: true },
    ];

    await prisma.kanbanColumn.createMany({ data: defaultData });
    return prisma.kanbanColumn.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
    });
};

export const createColumnService = async (projectId: string, title: string, order: number) => {
    return prisma.kanbanColumn.create({
        data: { projectId, title, order, status: TaskStatus.todo }
    });
};

export const updateColumnService = async (columnId: string, data: any) => {
    const column = await prisma.kanbanColumn.findUnique({ where: { id: columnId } });
    if (!column) {
        throw { statusCode: 404, message: 'Column not found.' };
    }

    // Bloquear edição do título se for coluna de conclusão
    if (column.isCompletionColumn && data.title && data.title !== column.title) {
        throw { statusCode: 400, message: 'O nome da coluna de conclusão não pode ser alterado.' };
    }

    return prisma.kanbanColumn.update({
        where: { id: columnId },
        data
    });
};

export const deleteColumnService = async (columnId: string) => {
    const column = await prisma.kanbanColumn.findUnique({ where: { id: columnId } });
    if (!column) {
        throw { statusCode: 404, message: 'Column not found.' };
    }

    // Bloquear exclusão da coluna de conclusão
    if (column.isCompletionColumn) {
        throw { statusCode: 400, message: 'A coluna de conclusão não pode ser excluída.' };
    }

    const tasksCount = await prisma.task.count({ where: { columnId } });
    if (tasksCount > 0) {
        throw { statusCode: 400, message: 'Cannot delete a column that contains tasks.' };
    }
    return prisma.kanbanColumn.delete({ where: { id: columnId } });
};

export const moveTaskService = async (taskId: string, columnId: string, userId: string, isAdmin: boolean) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { 
            project: { include: { members: true } },
            KanbanColumn: true // Buscar coluna atual
        }
    });

    if (!task) throw { statusCode: 404, message: 'Task not found' };

    /* Permissão removida conforme solicitação: qualquer usuário autenticado pode mover */
    // const isMember = task.project.members.some(m => m.userId === userId);
    // if (!isMember && !isAdmin) throw { statusCode: 403, message: 'Not authorized' };

    const newColumn = await prisma.kanbanColumn.findUnique({ where: { id: columnId } });
    if (!newColumn) throw { statusCode: 404, message: 'Column not found' };

    const oldColumn = task.KanbanColumn;
    const wasInCompletionColumn = oldColumn?.isCompletionColumn || false;
    const isGoingToCompletionColumn = newColumn.isCompletionColumn;

    // Se não há mudança de coluna, apenas retorna
    if (task.columnId === columnId) {
        return task;
    }

    // Import gamification functions
    const { addPointsForTaskCompletion, removePointsForTaskUncompletion } = await import('./gamification.service');

    return prisma.$transaction(async (tx) => {
        // Atualizar task
        const updatedTask = await tx.task.update({
            where: { id: taskId },
            data: { 
                columnId, 
                status: newColumn.status,
                completedAt: isGoingToCompletionColumn ? new Date() : (wasInCompletionColumn ? null : task.completedAt)
            }
        });

        // Lógica de pontuação
        if (task.assignedToId) {
            // Caso 1: Task entrando na coluna de conclusão
            if (!wasInCompletionColumn && isGoingToCompletionColumn) {
                await addPointsForTaskCompletion(task.assignedToId, task.pointsReward, taskId, tx);
                console.log(`[POINTS] Added ${task.pointsReward} points to user ${task.assignedToId} for completing task`);
            }

            // Caso 2: Task saindo da coluna de conclusão
            if (wasInCompletionColumn && !isGoingToCompletionColumn) {
                await removePointsForTaskUncompletion(task.assignedToId, task.pointsReward, taskId, tx);
                console.log(`[POINTS] Removed ${task.pointsReward} points from user ${task.assignedToId} for uncompleting task`);
            }
        }

        return updatedTask;
    });
};

export const reorderColumnsService = async (projectId: string, columnIds: string[]) => {
    return prisma.$transaction(
        columnIds.map((id, index) =>
            prisma.kanbanColumn.update({
                where: { id },
                data: { order: index }
            })
        )
    );
};

