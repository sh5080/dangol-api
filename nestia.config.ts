import { INestiaConfig } from "@nestia/sdk";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/app.module";
import { env } from "./src/configs/env.config";

const NESTIA_CONFIG: INestiaConfig = {
  input: async () => {
    const app = await NestFactory.create(AppModule);
    return app;
  },
  swagger: {
    openapi: "3.1",
    output: "dist/swagger.json",
    security: {
      bearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Local Server",
      },
    ],
    beautify: true,
  },
};
export default NESTIA_CONFIG;
