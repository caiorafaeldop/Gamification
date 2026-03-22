import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RankingController {
  /**
   * GET /ranking/hall-of-fame?year=2024
   * Lists the 52 slots for a given year. If a week hasn't been calculated or there are no winners, it returns null for that slot.
   */
  async getHallOfFame(req: Request, res: Response) {
    try {
      const yearParam = req.query.year as string;
      const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

      if (isNaN(year)) {
        return res.status(400).json({ status: 'error', message: 'Invalid year parameter' });
      }

      // Fetch all rankings for the given year, including user details
      const rankings = await prisma.weeklyRanking.findMany({
        where: { year },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              avatarColor: true,
              tier: true,
            }
          }
        },
        orderBy: [
          { week: 'asc' },
          { position: 'asc' }
        ]
      });

      // Prepare an array of 52 weeks
      // Each week can have an array of up to 3 winners (positions 1, 2, 3), or be null if no data
      const hallOfFame = Array.from({ length: 52 }, (_, i) => {
        const weekNum = i + 1;
        const weekRankings = rankings.filter(r => r.week === weekNum);
        
        if (weekRankings.length === 0) {
          return { week: weekNum, status: 'pending', winners: null };
        }

        return {
          week: weekNum,
          status: 'calculated',
          winners: weekRankings.map(r => ({
            position: r.position,
            points: r.points,
            user: r.user,
            postImageUrl: r.postImageUrl
          }))
        };
      });

      return res.status(200).json({ status: 'success', data: { year, hallOfFame } });
    } catch (error) {
      console.error('[RankingController] Error fetching Hall of Fame:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  /**
   * GET /ranking/arts
   * Lists all weekly rankings that might need arts generated (e.g., isPostGenerated is false)
   * or simply lists all of them. Leaving postImageUrl as null based on the prompt for now.
   */
  async getArts(req: Request, res: Response) {
    try {
      const weekParam = req.query.week as string;
      const yearParam = req.query.year as string;
      const limit = parseInt(req.query.limit as string) || 20;

      const where: any = {};
      if (weekParam) where.week = parseInt(weekParam, 10);
      if (yearParam) where.year = parseInt(yearParam, 10);

      const artsRankings = await prisma.weeklyRanking.findMany({
        where,
        take: limit,
        orderBy: [
          { year: 'desc' },
          { week: 'desc' },
          { position: 'asc' }
        ],
        include: {
          user: {
            select: {
              name: true,
              linkedinUrl: true,
              avatarUrl: true
            }
          }
        }
      });

      return res.status(200).json({ status: 'success', data: artsRankings });
    } catch (error) {
      console.error('[RankingController] Error fetching Arts:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
}

export const rankingController = new RankingController();
