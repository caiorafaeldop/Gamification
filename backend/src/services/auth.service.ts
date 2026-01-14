import { Prisma, Role } from '@prisma/client';
import { findUserByEmail, findUserByName, findUserById, createUser, updateUserTier } from '../repositories/user.repository';
import { hashPassword, comparePasswords } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { findTierByPoints, findAllTiers } from '../repositories/tier.repository';
import prisma from '../utils/prisma';

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw { statusCode: 409, message: 'User with this email already exists.' };
  }

  const hashedPassword = await hashPassword(data.password);

  // Find the initial tier based on 0 points
  const initialTier = await findTierByPoints(0);
  if (!initialTier) {
    throw { statusCode: 500, message: 'Default tier not found. Please seed tiers.' };
  }

  const user = await createUser({
    name: data.name,
    email: data.email,
    passwordHash: hashedPassword,
    role: data.role,
    connectaPoints: 0,
    tier: { connect: { id: initialTier.id } },
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role, connectaPoints: user.connectaPoints, tier: initialTier.name, course: user.course, avatarColor: user.avatarColor }, accessToken, refreshToken };
};

export const loginUser = async (data: LoginInput) => {
  let user = await findUserByEmail(data.email);

  if (!user) {
    user = await findUserByName(data.email);
  }

  if (!user || !user.isActive) {
    throw { statusCode: 401, message: 'Credenciais inválidas ou usuário inativo.' };
  }

  const passwordMatch = await comparePasswords(data.password, user.passwordHash);
  if (!passwordMatch) {
    throw { statusCode: 401, message: 'Credenciais inválidas.' };
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  const userWithTier = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tier: true },
  });

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role, connectaPoints: user.connectaPoints, tier: userWithTier?.tier.name, course: user.course, avatarColor: user.avatarColor }, accessToken, refreshToken };
};

export const refreshAuthToken = async (refreshToken: string) => {
  const decoded = verifyToken(refreshToken);

  if (!decoded) {
    throw { statusCode: 403, message: 'Invalid or expired refresh token.' };
  }

  const user = await findUserById(decoded.userId); // Corrigido: buscar por ID, não por email
  if (!user || !user.isActive) {
    throw { statusCode: 403, message: 'User not found or inactive.' };
  }

  const newAccessToken = generateAccessToken(user.id, user.role);
  const newRefreshToken = generateRefreshToken(user.id, user.role); // Optionally rotate refresh token

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const resetPassword = async (email: string, newPassword: string, secretWord: string) => {
  if (secretWord !== 'ciconectado') {
    throw { statusCode: 403, message: 'Invalid secret word.' };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw { statusCode: 404, message: 'User not found.' };
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedPassword },
  });

  return { message: 'Password reset successfully.' };
};