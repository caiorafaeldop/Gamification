import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { TaskStatus } from '@prisma/client';

export const getProjectKanban = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember && req.user?.role !== 'ADMIN') { // Basic check
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatarColor: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const columns = {
      [TaskStatus.todo]: tasks.filter((t) => t.status === TaskStatus.todo),
      [TaskStatus.in_progress]: tasks.filter((t) => t.status === TaskStatus.in_progress),
      [TaskStatus.done]: tasks.filter((t) => t.status === TaskStatus.done),
    };

    return res.json(columns);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching kanban board' });
  }
};

export const moveTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!Object.values(TaskStatus).includes(status)) {
    return res.status(400).json({ message: 'Invalid task status' });
  }

  try {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: { include: { members: true } } }
    }) as any; // Cast to any to avoid complex Prisma type deduction issues for now

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    // Verify permission: User must be member of the project or admin
    // Or maybe just assignee?
    // For now, any project member can move tasks (collaborative).
    const userId = req.user?.userId;
    const isMember = task.project.members.some((m: any) => m.userId === userId);
    
    if (!isMember && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized to move this task' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    return res.json(updatedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error moving task' });
  }
};
