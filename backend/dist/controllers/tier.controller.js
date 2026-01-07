"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTier = exports.updateTier = exports.getTiers = exports.getTier = exports.createTier = void 0;
const tier_service_1 = require("../services/tier.service");
const createTier = async (req, res, next) => {
    try {
        const tier = await (0, tier_service_1.createNewTier)(req.body);
        res.status(201).json(tier);
    }
    catch (error) {
        next(error);
    }
};
exports.createTier = createTier;
const getTier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tier = await (0, tier_service_1.getTierDetails)(id);
        res.status(200).json(tier);
    }
    catch (error) {
        next(error);
    }
};
exports.getTier = getTier;
const getTiers = async (req, res, next) => {
    try {
        const tiers = await (0, tier_service_1.getAllTiers)();
        res.status(200).json(tiers);
    }
    catch (error) {
        next(error);
    }
};
exports.getTiers = getTiers;
const updateTier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedTier = await (0, tier_service_1.updateTierDetails)(id, req.body);
        res.status(200).json(updatedTier);
    }
    catch (error) {
        next(error);
    }
};
exports.updateTier = updateTier;
const deleteTier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedTier = await (0, tier_service_1.deleteTierById)(id);
        res.status(200).json({ message: 'Tier deleted successfully', tier: deletedTier });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTier = deleteTier;
