import { z } from "zod";

const envSchema = z.object({
  // ********* server settings *********
  PORT: z.string().regex(/^\d+$/).transform(Number).optional().default("8080"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // ********* database *********
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().regex(/^\d+$/).transform(Number),
  REDIS_PASSWORD: z.string(),

  DISCORD_WEBHOOK_URL: z.string().url().optional(),
  // ********* auth *********
  ENCRYPTION_KEY: z.string().min(16),
  ACCESS_JWT_SECRET: z.string().min(16),
  REFRESH_JWT_SECRET: z.string().min(16),
  ACCESS_JWT_EXPIRATION: z.string().transform(Number),
  REFRESH_JWT_EXPIRATION: z.string().transform(Number),

  // ********* aws *********
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_KEY: z.string(),
  AWS_BUCKET_NAME: z.string(),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  db: {
    DATABASE_URL: parsedEnv.DATABASE_URL,
    REDIS_HOST: parsedEnv.REDIS_HOST,
    REDIS_PORT: parsedEnv.REDIS_PORT,
    REDIS_PASSWORD: parsedEnv.REDIS_PASSWORD,
  },
  auth: {
    ENCRYPTION_KEY: z.string().min(16),
    ACCESS_JWT_SECRET: parsedEnv.ACCESS_JWT_SECRET,
    REFRESH_JWT_SECRET: parsedEnv.REFRESH_JWT_SECRET,
    ACCESS_JWT_EXPIRATION: parsedEnv.ACCESS_JWT_EXPIRATION,
    REFRESH_JWT_EXPIRATION: parsedEnv.REFRESH_JWT_EXPIRATION,
  },
  aws: {
    AWS_REGION: parsedEnv.AWS_REGION,
    AWS_ACCESS_KEY_ID: parsedEnv.AWS_ACCESS_KEY_ID,
    AWS_SECRET_KEY: parsedEnv.AWS_SECRET_KEY,
    AWS_BUCKET_NAME: parsedEnv.AWS_BUCKET_NAME,
  },
};

export type Env = typeof env;
