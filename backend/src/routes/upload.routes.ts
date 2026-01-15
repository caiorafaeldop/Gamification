import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

const router = Router();
router.use(authenticate);

router.post('/', upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: req.file.path });
});

export default router;
