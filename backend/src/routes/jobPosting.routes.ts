import { Router } from 'express';
import { create, list, detail, update, remove } from '../controllers/jobPosting.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import { optionalAuth } from '../middlewares/optionalAuth';

const router = Router();

// Leitura pública
router.get('/', optionalAuth, list);
router.get('/:id', optionalAuth, detail);

// Mutações exigem login
router.post('/', unifiedAuth, create);
router.patch('/:id', unifiedAuth, update);
router.delete('/:id', unifiedAuth, remove);

export default router;
