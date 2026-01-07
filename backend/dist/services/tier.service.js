"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTierById = exports.updateTierDetails = exports.getAllTiers = exports.getTierDetails = exports.createNewTier = void 0;
const tier_repository_1 = require("../repositories/tier.repository");
const prisma_1 = __importDefault(require("../utils/prisma"));
const createNewTier = async (data) => {
    const existingTier = await (0, tier_repository_1.findTierByName)(data.name);
    if (existingTier) {
        throw { statusCode: 409, message: 'Tier with this name already exists.' };
    }
    const tier = await (0, tier_repository_1.createTier)(data);
    return tier;
};
exports.createNewTier = createNewTier;
const getTierDetails = async (id) => {
    const tier = await (0, tier_repository_1.findTierById)(id);
    if (!tier) {
        throw { statusCode: 404, message: 'Tier not found.' };
    }
    return tier;
};
exports.getTierDetails = getTierDetails;
const getAllTiers = async () => {
    return (0, tier_repository_1.findAllTiers)();
};
exports.getAllTiers = getAllTiers;
const updateTierDetails = async (id, data) => {
    const tier = await (0, tier_repository_1.findTierById)(id);
    if (!tier) {
        throw { statusCode: 404, message: 'Tier not found.' };
    }
    const updatedTier = await (0, tier_repository_1.updateTier)(id, data);
    return updatedTier;
};
exports.updateTierDetails = updateTierDetails;
const deleteTierById = async (id) => {
    const tier = await (0, tier_repository_1.findTierById)(id);
    if (!tier) {
        throw { statusCode: 404, message: 'Tier not found.' };
    }
    // Check if any users are currently in this tier before deleting
    const usersInTier = await prisma_1.default.user.count({ where: { tierId: id } });
    if (usersInTier > 0) {
        throw { statusCode: 400, message: 'Cannot delete tier with active users. Reassign users first.' };
    }
    const tasksRequiringTier = await prisma_1.default.task.count({ where: { requiredTierId: id } });
    if (tasksRequiringTier > 0) {
        throw { statusCode: 400, message: 'Cannot delete tier required by active tasks. Update tasks first.' };
    }
    await (0, tier_repository_1.deleteTier)(id);
    return tier;
};
exports.deleteTierById = deleteTierById;
