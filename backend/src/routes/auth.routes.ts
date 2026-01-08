import { Router } from 'express';
import { register, login, refresh, resetPassword } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema, registerSchema, refreshTokenSchema, resetPasswordSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;