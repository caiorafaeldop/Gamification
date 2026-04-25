import { Router } from 'express';
import { create, list, detail, update, remove } from '../controllers/jobPosting.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';

const router = Router();

router.use(unifiedAuth);

router.get('/', list);
router.post('/', create);
router.get('/:id', detail);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
