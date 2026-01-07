"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserActiveStatus = exports.promoteUserRole = exports.getAllUsers = exports.getUserActivity = exports.adjustUserPoints = exports.updateUserDetails = exports.getUserProfile = exports.getMyProfile = void 0;
const user_service_1 = require("../services/user.service");
const getMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const profile = await (0, user_service_1.getMyProfile)(userId);
        res.status(200).json(profile);
    }
    catch (error) {
        next(error);
    }
};
exports.getMyProfile = getMyProfile;
const getUserProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const profile = await (0, user_service_1.getUserProfile)(id);
        res.status(200).json(profile);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserProfile = getUserProfile;
const updateUserDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserRole = req.user.role;
        const updatedUser = await (0, user_service_1.updateUserDetails)(id, req.body, requestingUserRole);
        res.status(200).json(updatedUser);
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserDetails = updateUserDetails;
const adjustUserPoints = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;
        const updatedUser = await (0, user_service_1.adjustUserPoints)(id, req.body, adminId);
        res.status(200).json(updatedUser);
    }
    catch (error) {
        next(error);
    }
};
exports.adjustUserPoints = adjustUserPoints;
const getUserActivity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const activities = await (0, user_service_1.getUserActivity)(id, page, limit);
        res.status(200).json(activities);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserActivity = getUserActivity;
const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await (0, user_service_1.getAllUsers)(page, limit);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
const promoteUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const adminId = req.user.userId;
        const updatedUser = await (0, user_service_1.promoteUserRole)(id, role, adminId);
        res.status(200).json(updatedUser);
    }
    catch (error) {
        next(error);
    }
};
exports.promoteUserRole = promoteUserRole;
const toggleUserActiveStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const adminId = req.user.userId;
        const updatedUser = isActive
            ? await (0, user_service_1.activateUser)(id, adminId)
            : await (0, user_service_1.deactivateUser)(id, adminId);
        res.status(200).json(updatedUser);
    }
    catch (error) {
        next(error);
    }
};
exports.toggleUserActiveStatus = toggleUserActiveStatus;
