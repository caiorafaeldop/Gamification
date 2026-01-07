import { Router } from 'express';
import { register, login, refresh } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema, registerSchema, refreshTokenSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refresh);

export default router;