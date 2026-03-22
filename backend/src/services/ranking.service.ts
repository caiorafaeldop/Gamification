import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RankingService {
  /**
   * Calculates the weekly ranking based on points from ActivityLog for the previous week (Sunday to Sunday).
   * Takes the Top 3 and saves/updates them in the WeeklyRanking table.
   */
  async calculateWeeklyRanking() {
    console.log('[RankingService] Starting Weekly Ranking calculation...');
    const now = new Date();
    
    // We want the previous week.
    // Let's define the previous week's boundaries.
    // Standard JS dates: Sunday is 0, Saturday is 6.
    const currentDayOfWeek = now.getDay();
    
    // If today is Sunday, we want to look at the last 7 days (including today if run at 23:59).
    // Let's explicitly calculate the start of the previous Sunday and end of Saturday.
    const lastSaturday = new Date(now);
    lastSaturday.setDate(now.getDate() - currentDayOfWeek - 1);
    lastSaturday.setHours(23, 59, 59, 999);

    const previousSunday = new Date(lastSaturday);
    previousSunday.setDate(lastSaturday.getDate() - 6);
    previousSunday.setHours(0, 0, 0, 0);

    // Get the ISO week number for the previous Sunday to use as the designated 'week' number.
    // A simple method for week number based on the previous Sunday:
    const startOfYear = new Date(previousSunday.getFullYear(), 0, 1);
    const days = Math.floor((previousSunday.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((previousSunday.getDay() + 1 + days) / 7);
    const yearNumber = previousSunday.getFullYear();

    console.log(`[RankingService] Calculation period: ${previousSunday.toISOString()} to ${lastSaturday.toISOString()} (Week ${weekNumber}, ${yearNumber})`);

    // Aggregate points from ActivityLog
    const activityLogs = await prisma.activityLog.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: previousSunday,
          lte: lastSaturday,
        },
        pointsChange: {
          not: null, // Ensure we only count logs with points
        }
      },
      _sum: {
        pointsChange: true,
      },
      orderBy: {
        _sum: {
          pointsChange: 'desc',
        },
      },
      take: 3, // Only Top 3 are needed for the podium
    });

    if (activityLogs.length === 0) {
      console.log('[RankingService] No activity logs found with points for the calculated period.');
      return;
    }

    // Prepare and upsert the WeeklyRanking records
    const rankingPromises = activityLogs.map((log, index) => {
      const position = index + 1; // 1, 2, 3
      const points = log._sum.pointsChange || 0;

      return prisma.weeklyRanking.upsert({
        where: {
          week_year_position: {
            week: weekNumber,
            year: yearNumber,
            position: position,
          },
        },
        update: {
          userId: log.userId,
          points: points,
          // Re-setting flags in case properties change for an already calculated week
          isPostGenerated: false,
          instagramShared: false,
          linkedinShared: false,
        },
        create: {
          userId: log.userId,
          position: position,
          week: weekNumber,
          year: yearNumber,
          points: points,
          postImageUrl: null,
          isPostGenerated: false,
          instagramShared: false,
          linkedinShared: false,
        },
      });
    });

    await Promise.all(rankingPromises);
    console.log(`[RankingService] Weekly Ranking successfully calculated and saved for Week ${weekNumber}, ${yearNumber}. Target users top 3: ${activityLogs.map(a => a.userId).join(', ')}`);
  }
}

export const rankingService = new RankingService();
