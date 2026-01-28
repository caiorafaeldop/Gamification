import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { Role } from '@prisma/client';

interface JwtPayload {
  userId: string;
  role: Role;
}

export const generateAccessToken = (userId: string, role: Role): string => {
  return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: config.jwtAccessExpiration } as SignOptions);
};

export const generateRefreshToken = (userId: string, role: Role): string => {
  return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: config.jwtRefreshExpiration } as SignOptions);
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch (error) {
    return null;
  }
};
