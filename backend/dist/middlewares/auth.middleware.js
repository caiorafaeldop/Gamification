"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = __importDefault(require("../utils/prisma"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided or invalid format.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, jwt_1.verifyToken)(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    const user = await prisma_1.default.user.findUnique({
        where: { id: decoded.userId },
    });
    if (!user || !user.isActive) {
        return res.status(401).json({ message: 'User not found or inactive.' });
    }
    req.user = { userId: user.id, role: user.role };
    next();
};
exports.authenticate = authenticate;
