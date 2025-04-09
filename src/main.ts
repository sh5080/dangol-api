import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestiaSwaggerComposer } from "@nestia/sdk";
import { SwaggerModule } from "@nestjs/swagger";
import { env } from "./configs/env.config";
import NESTIA_CONFIG from "../nestia.config";
import { Logger } from "nestjs-pino";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: ["http://localhost:3000"],
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
