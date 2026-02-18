import { Router } from 'express';
import { getStoreItems, purchaseItem } from '../controllers/store.controller';
import { unifiedAuth } from '../middlewares/unifiedAuth';

const router = Router();

router.use(unifiedAuth);

router.get('/items', getStoreItems);
router.post('/buy', purchaseItem);

export default router;
