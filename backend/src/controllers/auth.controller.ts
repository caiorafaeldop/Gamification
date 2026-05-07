import { Request, Response, NextFunction } from 'express';
import { LoginInput, RegisterInput, RefreshTokenInput } from '../schemas/auth.schema';
import { registerUser, loginUser, refreshAuthToken, googleLogin as googleLoginService } from '../services/auth.service';

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

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    const result = await googleLoginService(token);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
