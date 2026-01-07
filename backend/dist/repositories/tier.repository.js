"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTierByPoints = exports.deleteTier = exports.updateTier = exports.findAllTiers = exports.findTierByName = exports.findTierById = exports.createTier = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const createTier = async (data) => {
    return prisma_1.default.tier.create({ data });
};
exports.createTier = createTier;
const findTierById = async (id) => {
    return prisma_1.default.tier.findUnique({ where: { id } });
};
exports.findTierById = findTierById;
const findTierByName = async (name) => {
    return prisma_1.default.tier.findUnique({ where: { name } });
};
exports.findTierByName = findTierByName;
const findAllTiers = async () => {
    return prisma_1.default.tier.findMany({ orderBy: { order: 'asc' } });
};
exports.findAllTiers = findAllTiers;
const updateTier = async (id, data) => {
    return prisma_1.default.tier.update({ where: { id }, data });
};
exports.updateTier = updateTier;
const deleteTier = async (id) => {
    return prisma_1.default.tier.delete({ where: { id } });
};
exports.deleteTier = deleteTier;
const findTierByPoints = async (points) => {
    const tier = await prisma_1.default.tier.findMany({
        where: { minPoints: { lte: points } },
        orderBy: { minPoints: 'desc' },
        take: 1,
    });
    return tier[0];
};
exports.findTierByPoints = findTierByPoints;
