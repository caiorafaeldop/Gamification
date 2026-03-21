import { Request, Response, NextFunction } from 'express';
import { getSystemOverview as getSystemOverviewService, getPublicProfile as getPublicProfileService } from '../services/stats.service';

export const getSystemOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const overview = await getSystemOverviewService();
        res.status(200).json(overview);
    } catch (error) {
        next(error);
    }
};

export const getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const profile = await getPublicProfileService(userId);
        res.status(200).json(profile);
    } catch (error) {
        // Enviaremos 404 de forma simplificada se não achar o usuário, ou podemos deixar o middleware global pegar o erro
        if (error instanceof Error && error.message === 'Usuário não encontrado') {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};
