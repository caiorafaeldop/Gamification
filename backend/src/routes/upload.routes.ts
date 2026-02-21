import { Router, Request, Response } from 'express';
import { unifiedAuth } from '../middlewares/unifiedAuth';
import upload from '../middlewares/upload.middleware';

const router = Router();
router.use(unifiedAuth);

router.post('/', upload.single('file') as any, (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: req.file.path });
});

export default router;
