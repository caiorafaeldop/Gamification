import { Request, Response, NextFunction } from 'express';
import { LoginInput, RegisterInput, RefreshTokenInput, ResetPasswordInput } from '../schemas/auth.schema';
import { registerUser, loginUser, refreshAuthToken, resetPassword as resetUserPassword } from '../services/auth.service';

export const register = async (req: Request<{}, {}, RegisterInput>, res: Response, next: NextFunction) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request<{}, {}, LoginInput>, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const refresh = async (req: Request<{}, {}, RefreshTokenInput>, res: Response, next: NextFunction) => {
  try {
    const result = await refreshAuthToken(req.body.refreshToken);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const resetPassword = async (req: Request<{}, {}, ResetPasswordInput>, res: Response, next: NextFunction) => {
  try {
    const { email, newPassword, secretWord } = req.body;
    const result = await resetUserPassword(email, newPassword, secretWord);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
