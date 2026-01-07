"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAuthToken = exports.loginUser = exports.registerUser = void 0;
const user_repository_1 = require("../repositories/user.repository");
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const tier_repository_1 = require("../repositories/tier.repository");
const prisma_1 = __importDefault(require("../utils/prisma"));
const registerUser = async (data) => {
    const existingUser = await (0, user_repository_1.findUserByEmail)(data.email);
    if (existingUser) {
        throw { statusCode: 409, message: 'User with this email already exists.' };
    }
    const hashedPassword = await (0, bcrypt_1.hashPassword)(data.password);
    // Find the initial tier based on 0 points
    const initialTier = await (0, tier_repository_1.findTierByPoints)(0);
    if (!initialTier) {
        throw { statusCode: 500, message: 'Default tier not found. Please seed tiers.' };
    }
    const user = await (0, user_repository_1.createUser)({
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
        connectaPoints: 0,
        tier: { connect: { id: initialTier.id } },
    });
    const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id, user.role);
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role, connectaPoints: user.connectaPoints, tier: initialTier.name }, accessToken, refreshToken };
};
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const user = await (0, user_repository_1.findUserByEmail)(data.email);
    if (!user || !user.isActive) {
        throw { statusCode: 401, message: 'Invalid credentials or user is inactive.' };
    }
    const passwordMatch = await (0, bcrypt_1.comparePasswords)(data.password, user.passwordHash);
    if (!passwordMatch) {
        throw { statusCode: 401, message: 'Invalid credentials.' };
    }
    const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id, user.role);
    const userWithTier = await prisma_1.default.user.findUnique({
        where: { id: user.id },
        include: { tier: true },
    });
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role, connectaPoints: user.connectaPoints, tier: userWithTier?.tier.name }, accessToken, refreshToken };
};
exports.loginUser = loginUser;
const refreshAuthToken = async (refreshToken) => {
    const decoded = (0, jwt_1.verifyToken)(refreshToken);
    if (!decoded) {
        throw { statusCode: 403, message: 'Invalid or expired refresh token.' };
    }
    const user = await (0, user_repository_1.findUserByEmail)(decoded.userId); // Assuming userId is stored in refresh token
    if (!user || !user.isActive) {
        throw { statusCode: 403, message: 'User not found or inactive.' };
    }
    const newAccessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
    const newRefreshToken = (0, jwt_1.generateRefreshToken)(user.id, user.role); // Optionally rotate refresh token
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
exports.refreshAuthToken = refreshAuthToken;
