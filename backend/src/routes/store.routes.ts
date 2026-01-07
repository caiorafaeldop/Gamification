import { Router } from 'express';
import { getStoreItems, purchaseItem } from '../controllers/store.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/items', getStoreItems);
router.post('/buy', purchaseItem);

export default router;
