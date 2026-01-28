import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  JWT_ACCESS_EXPIRATION: z.string().default("1h"),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),
  PORT: z.coerce.number().default(3333),
  // Modificado CORS_ORIGIN para permitir uma URL ou um curinga '*'
  CORS_ORIGIN: z.union([z.string().url(), z.literal('*')]).default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const config = {
  databaseUrl: parsedEnv.data.DATABASE_URL,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  jwtAccessExpiration: parsedEnv.data.JWT_ACCESS_EXPIRATION,
  jwtRefreshExpiration: parsedEnv.data.JWT_REFRESH_EXPIRATION,
  port: parsedEnv.data.PORT,
  corsOrigin: parsedEnv.data.CORS_ORIGIN,
  nodeEnv: parsedEnv.data.NODE_ENV,
};

// DEBUG: Adicionando logs para verificar o JWT_SECRET
console.log("DEBUG: JWT_SECRET length:", config.jwtSecret.length);
console.log("DEBUG: JWT_SECRET (first 5 chars):", config.jwtSecret.substring(0, 5));
