import { Router } from 'express';
import { getSystemOverview } from '../controllers/stats.controller';

const router = Router();

// Rota pública para visão geral do sistema (usuários, projetos, eventos)
router.get('/', getSystemOverview);

export default router;
