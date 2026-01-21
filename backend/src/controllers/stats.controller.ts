import { Request, Response, NextFunction } from 'express';
import { getSystemOverview as getSystemOverviewService } from '../services/stats.service';

export const getSystemOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const overview = await getSystemOverviewService();
        res.status(200).json(overview);
    } catch (error) {
        next(error);
    }
};
