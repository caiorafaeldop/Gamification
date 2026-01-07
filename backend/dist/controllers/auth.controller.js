"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const register = async (req, res, next) => {
    try {
        const result = await (0, auth_service_1.registerUser)(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const result = await (0, auth_service_1.loginUser)(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const result = await (0, auth_service_1.refreshAuthToken)(req.body.refreshToken);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
