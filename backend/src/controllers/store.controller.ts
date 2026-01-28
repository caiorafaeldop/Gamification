import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getStoreItems = async (req: Request, res: Response) => {
  try {
    const items = await prisma.storeItem.findMany({
      orderBy: { cost: 'asc' },
    });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching store items' });
  }
};

export const purchaseItem = async (req: Request, res: Response) => {
  const { itemId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const item = await tx.storeItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        throw { status: 404, message: 'Item not found' };
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw { status: 404, message: 'User not found' };
      }

      if (user.famenePoints < item.cost) {
        throw { status: 400, message: 'Insufficient points' };
      }

      // Deduct points
      await tx.user.update({
        where: { id: userId },
        data: { famenePoints: { decrement: item.cost } },
      });

      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          itemId,
          cost: item.cost,
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId,
          type: 'POINTS_ADJUSTED', // Use appropriate enum if available
          description: `Purchased ${item.name}`,
          pointsChange: -item.cost,
        },
      });

      return res.json(order);
    });
  } catch (error: any) {
    console.error(error);
    const status = error.status || 500;
    return res.status(status).json({ message: error.message || 'Error processing purchase' });
  }
};

