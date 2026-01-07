"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const generateAccessToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ userId, role }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtAccessExpiration });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ userId, role }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtRefreshExpiration });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
