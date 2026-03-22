import cron from 'node-cron';
import { rankingService } from '../services/ranking.service';

/**
 * Initializes the weekly ranking cron job.
 * Runs every Sunday at 23:59 (0 59 23 * * 0)
 */
export const initWeeklyRankingJob = () => {
  console.log('[Cron] Initializing Weekly Ranking Job (0 59 23 * * 0)...');
  
  cron.schedule('0 59 23 * * 0', async () => {
    try {
      console.log('[Cron] Execution triggered for Weekly Ranking Job...');
      await rankingService.calculateWeeklyRanking();
      console.log('[Cron] Execution completed successfully for Weekly Ranking Job.');
    } catch (error) {
      console.error('[Cron] Error executing Weekly Ranking Job:', error);
    }
  });
};
