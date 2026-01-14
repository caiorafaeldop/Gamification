import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { TaskStatus, Role } from '@prisma/client';
import { createNewColumn, updateColumnDetails, removeColumn, initializeProjectColumns } from '../services/column.service';
import { moveTaskStatus } from '../services/task.service';

export const getProjectKanban = async (req: Request, res: Response): Promise<Response> => {
  const { projectId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              include: {
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    avatarColor: true,
                    // avatarUrl: true, // Assuming it might exist or added later
                  }
                }
              }
            }
          }
        }
      },
    }) as any;

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // If project has no columns, initialize them
    if (project.columns.length === 0) {
      await initializeProjectColumns(projectId);
      const updatedProject = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          columns: {
            orderBy: { order: 'asc' },
            include: { tasks: { include: { assignedTo: true } } }
          }
        }
      }) as any;

      const kanbanData: Record<string, any[]> = {};
      updatedProject.columns.forEach((col: any) => {
        kanbanData[col.id] = col.tasks;
      });

      return res.json({
        board: kanbanData,
        columns: updatedProject.columns
      });
    }

    const isMember = project.members.some((m: any) => m.userId === userId);
    if (!isMember && req.user?.role !== Role.ADMIN) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    // Format for frontend: { "Column ID": [Tasks], ... }
    const kanbanData: Record<string, any[]> = {};
    project.columns.forEach((col: any) => {
      kanbanData[col.id] = col.tasks;
    });

    // Provide column metadata as well
    return res.json({
      board: kanbanData,
      columns: project.columns
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching kanban board' });
  }
};

export const createColumn = async (req: Request, res: Response): Promise<Response> => {
  const { projectId } = req.params;
  const { title } = req.body;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isAuthorized = userRole === Role.ADMIN || project.leaderId === userId;
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Only project leader or admin can create columns' });
    }

    const column = await createNewColumn(projectId, title);
    return res.status(201).json(column);
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updateColumn = async (req: Request, res: Response): Promise<Response> => {
  const { columnId } = req.params;
  const { title, order, status } = req.body;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  try {
    const columnToUpdate = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      include: { project: true }
    });

    if (!columnToUpdate) return res.status(404).json({ message: 'Column not found' });

    const isAuthorized = userRole === Role.ADMIN || columnToUpdate.project.leaderId === userId;
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Only project leader or admin can update columns' });
    }

    const data: any = { title, order };
    if (status) data.status = status;

    const column = await prisma.kanbanColumn.update({
      where: { id: columnId },
      data
    });
    return res.json(column);
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const deleteColumnController = async (req: Request, res: Response): Promise<Response> => {
  const { columnId } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  try {
    const columnToDelete = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      include: { project: true }
    });

    if (!columnToDelete) return res.status(404).json({ message: 'Column not found' });

    const isAuthorized = userRole === Role.ADMIN || columnToDelete.project.leaderId === userId;
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Only project leader or admin can delete columns' });
    }

    await removeColumn(columnId);
    return res.json({ message: 'Column deleted successfully' });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const moveTask = async (req: Request, res: Response): Promise<Response> => {
  const { taskId } = req.params;
  const { columnId } = req.body; // New version uses columnId

  try {
    const column = await prisma.kanbanColumn.findUnique({ where: { id: columnId } }) as any;
    if (!column) {
      return res.status(404).json({ message: 'Target column not found' });
    }

    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Move task status logic
    await moveTaskStatus(taskId, { newStatus: column.status }, userId, userRole);

    // Update task's columnId
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { columnId: columnId },
      include: { assignedTo: true }
    });

    return res.json(updatedTask);
  } catch (error: any) {
    console.error(error);
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const reorderColumns = async (req: Request, res: Response): Promise<Response> => {
  const { projectId } = req.params;
  const { columnIds } = req.body; // Array of IDs in the new order
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isAuthorized = userRole === Role.ADMIN || project.leaderId === userId;
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Only project leader or admin can reorder columns' });
    }

    // Update each column order
    await Promise.all(
      columnIds.map((id: string, index: number) =>
        prisma.kanbanColumn.update({
          where: { id },
          data: { order: index }
        })
      )
    );

    return res.json({ message: 'Columns reordered successfully' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Error reordering columns' });
  }
};
