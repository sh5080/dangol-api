import { z } from "zod";
import dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(process.cwd(), ".env") });
const envSchema = z.object({
  // ********* server settings *********
  PORT: z.string().regex(/^\d+$/).transform(Number).optional().default("8080"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  TUNNEL_KEY: z.string(),
  GRAFANA_CLOUD_USER: z.string(),
  GRAFANA_CLOUD_API_KEY: z.string(),

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
  MAIL_VERIFY_EXPIRATION: z.string().transform(Number),
  AFTER_MAIL_VERIFY_EXPIRATION: z.string().transform(Number),

  // ********* mail *********
  MAIL_USER: z.string(),
  MAIL_PASSWORD: z.string(),
  MAIL_SERVICE: z.string(),
  MAIL_PORT: z.string().transform(Number),
  MAIL_HOST: z.string(),
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

    MAIL_VERIFY_EXPIRATION: parsedEnv.MAIL_VERIFY_EXPIRATION,
    AFTER_MAIL_VERIFY_EXPIRATION: parsedEnv.AFTER_MAIL_VERIFY_EXPIRATION,
  },
  mail: {
    MAIL_USER: parsedEnv.MAIL_USER,
    MAIL_PASSWORD: parsedEnv.MAIL_PASSWORD,
    MAIL_SERVICE: parsedEnv.MAIL_SERVICE,
    MAIL_PORT: parsedEnv.MAIL_PORT,
    MAIL_HOST: parsedEnv.MAIL_HOST,
  },
  aws: {
    AWS_REGION: parsedEnv.AWS_REGION,
    AWS_ACCESS_KEY_ID: parsedEnv.AWS_ACCESS_KEY_ID,
    AWS_SECRET_KEY: parsedEnv.AWS_SECRET_KEY,
    AWS_BUCKET_NAME: parsedEnv.AWS_BUCKET_NAME,
  },
};

export type Env = typeof env;
