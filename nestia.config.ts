import { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/app.module";
import { env } from "./src/configs/env.config";

const SERVER_URLS = {
  production: "https://boilerplate-api-r9f3.onrender.com",
  stage: "https://gratefully-genuine-katydid.ngrok-free.app",
  development: `http://localhost:${env.PORT}`,
};

const servers = [{ url: SERVER_URLS[env.NODE_ENV], description: env.NODE_ENV }];

const NESTIA_CONFIG: INestiaConfig = {
  input: async () => {
    return await NestFactory.create(AppModule);
  },
  swagger: {
    openapi: "3.1",
    output: "dist/swagger.json",
    security: {
      bearer: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    servers,
    beautify: true,
  },
};
export default NESTIA_CONFIG;
