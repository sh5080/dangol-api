import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { NestiaSwaggerComposer } from "@nestia/sdk";
import { SwaggerModule } from "@nestjs/swagger";
import { env } from "./configs/env.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 미들웨어 설정
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "https://dev.nuworks.io",
      "https://nuworks.io",
      "https://www.nuworks.io",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
  app.setGlobalPrefix("api");
  const document = await NestiaSwaggerComposer.document(app, {
    openapi: "3.1",
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "nuworks-api",
      },
    ],
  });
  SwaggerModule.setup("docs", app, document as any);
  await app.listen(env.PORT);
  console.log(`Server is running on port ${env.PORT}`);
}

bootstrap();
