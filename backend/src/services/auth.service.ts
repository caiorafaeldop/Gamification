import { Prisma, Role } from '@prisma/client';
import { findUserByEmail, findUserByName, findUserById, createUser, updateUserTier } from '../repositories/user.repository';
import { hashPassword, comparePasswords } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { findTierByPoints, findAllTiers } from '../repositories/tier.repository';
import prisma from '../utils/prisma';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

const googleClient = new OAuth2Client(config.googleClientId);

async function getUserInfoFromAccessToken(accessToken: string) {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user info from Google:', error);
    return null;
  }
}

export const googleLogin = async (token: string) => {
  try {
    let payload: any = null;

    if (token.startsWith('eyJ')) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: config.googleClientId,
        });
        payload = ticket.getPayload();
      } catch (e) {
        console.log('Token is not a valid ID Token, trying as Access Token...');
      }
    }

    if (!payload) {
      payload = await getUserInfoFromAccessToken(token);
    }

    if (!payload || !payload.email) {
      throw { statusCode: 401, message: 'Invalid Google token.' };
    }

    const email = payload.email.toLowerCase();
    let user = await findUserByEmail(email);

    if (!user) {
      const initialTier = await findTierByPoints(0);
      if (!initialTier) {
        throw { statusCode: 500, message: 'Default tier not found. Please seed tiers.' };
      }

      user = await createUser({
        name: payload.name || 'Usuário Google',
        email: email,
        passwordHash: '',
        role: Role.MEMBER,
        connectaPoints: 0,
        avatarUrl: payload.picture,
        tier: { connect: { id: initialTier.id } },
      });
    }

    if (!user.isActive) {
      throw { statusCode: 401, message: 'User is inactive.' };
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    const userWithTier = await prisma.user.findUnique({
      where: { id: user.id },
      include: { tier: true },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        connectaPoints: user.connectaPoints,
        tier: userWithTier?.tier.name,
        course: user.course,
        avatarColor: user.avatarColor,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
      refreshToken,
    };
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    if (error.statusCode) throw error;
    throw { statusCode: 401, message: `Google Auth failed: ${error.message || 'Unknown error'}` };
  }
};

export const registerUser = async (data: RegisterInput) => {
  const email = data.email.toLowerCase();
  const existingUser = await findUserByEmail(email);
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
    email: email,
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

  if (!user.passwordHash || user.passwordHash === '') {
    throw { statusCode: 401, message: 'Esta conta usa login social. Entre com o Google.' };
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

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });
  } catch (error) {
    throw error;
  }

  return { message: 'Password reset successfully.' };
};