
import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Generates a short-lived access token.
 */
export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: config.jwtAccessExpiration as any });
};

/**
 * Generates a long-lived refresh token.
 */
export const generateRefreshToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: config.jwtRefreshExpiration as any });
};

/**
 * Verifies a token and returns the decoded payload.
 * Returns null if the token is invalid or expired.
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};
