"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z
        .string()
        .min(32, "JWT_SECRET must be at least 32 characters long"),
    JWT_ACCESS_EXPIRATION: zod_1.z.string().default("1h"),
    JWT_REFRESH_EXPIRATION: zod_1.z.string().default("7d"),
    PORT: zod_1.z.coerce.number().default(3000),
    // Modificado CORS_ORIGIN para permitir uma URL ou um curinga '*'
    CORS_ORIGIN: zod_1.z.union([zod_1.z.string().url(), zod_1.z.literal('*')]).default("http://localhost:5173"),
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    throw new Error("Invalid environment variables");
}
exports.config = {
    databaseUrl: parsedEnv.data.DATABASE_URL,
    jwtSecret: parsedEnv.data.JWT_SECRET,
    jwtAccessExpiration: parsedEnv.data.JWT_ACCESS_EXPIRATION,
    jwtRefreshExpiration: parsedEnv.data.JWT_REFRESH_EXPIRATION,
    port: parsedEnv.data.PORT,
    corsOrigin: parsedEnv.data.CORS_ORIGIN,
    nodeEnv: parsedEnv.data.NODE_ENV,
};
