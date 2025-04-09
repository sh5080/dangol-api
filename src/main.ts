import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestiaSwaggerComposer } from "@nestia/sdk";
import { SwaggerModule } from "@nestjs/swagger";
import { env } from "./shared/configs/env.config";
import NESTIA_CONFIG from "../nestia.config";
import { Logger } from "nestjs-pino";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const SERVER_URLS = {
    production: env.serverUrl.PRD,
    stage: env.serverUrl.STG,
    development: env.serverUrl.DEV,
    local: `http://localhost:12000`,
    chat: env.serverUrl.CHAT,
  };

  app.enableCors({
    origin: [SERVER_URLS[env.NODE_ENV], SERVER_URLS.local, SERVER_URLS.chat],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    credentials: true,
  });
  app.setGlobalPrefix("api");
  const document = await NestiaSwaggerComposer.document(
    app,
    NESTIA_CONFIG.swagger as any
  );

  SwaggerModule.setup("docs", app, document as any, {
    jsonDocumentUrl: "api-json",
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  await app.listen(env.PORT);
  console.log(`Server is running on port ${env.PORT}`);
}

bootstrap();
