import { Request, Response, NextFunction } from 'express';
import { getMyProfile as getMyProfileService, getUserProfile as getUserProfileService, updateUserDetails as updateUserDetailsService, adjustUserPoints as adjustUserPointsService, getUserActivity as getUserActivityService, getAllUsers as getAllUsersService, promoteUserRole as promoteUserRoleService, deactivateUser, activateUser } from '../services/user.service';
import { UpdateUserInput, UpdateUserPointsInput } from '../schemas/user.schema';
import { Role } from '@prisma/client';

export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profile = await getMyProfileService(userId);
    console.log('DEBUG: Profile fetched for user:', profile.id, profile.name);
    res.status(200).json(profile);
  } catch (error: any) {
    next(error);
  }
};

export const getUserProfile = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const profile = await getUserProfileService(id);
    res.status(200).json(profile);
  } catch (error: any) {
    next(error);
  }
};

export const updateUserDetails = async (req: Request<{ id: string }, {}, UpdateUserInput>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const requestingUserRole = req.user!.role;
    const updatedUser = await updateUserDetailsService(id, req.body, requestingUserRole);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    next(error);
  }
};

export const adjustUserPoints = async (req: Request<{ id: string }, {}, UpdateUserPointsInput>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;
    const updatedUser = await adjustUserPointsService(id, req.body, adminId);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    next(error);
  }
};

export const getUserActivity = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await getUserActivityService(id, page, limit);
    res.status(200).json(activities);
  } catch (error: any) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await getAllUsersService(page, limit);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const promoteUserRole = async (req: Request<{ id: string }, {}, { role: Role }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user!.userId;
    const updatedUser = await promoteUserRoleService(id, role, adminId);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    next(error);
  }
};

export const toggleUserActiveStatus = async (req: Request<{ id: string }, {}, { isActive: boolean }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const adminId = req.user!.userId;

    const updatedUser = isActive
      ? await activateUser(id, adminId)
      : await deactivateUser(id, adminId);

    res.status(200).json(updatedUser);
  } catch (error: any) {
    next(error);
  }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    res.status(200).json({
      url: (req.file as any).path, // Cloudinary URL
    });
  } catch (error: any) {
    next(error);
  }
};
