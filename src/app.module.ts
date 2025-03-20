import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { GlobalExceptionFilter } from "./middlewares/error.middleware";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { LoggerModule } from "nestjs-pino";
import { pinoHttpOptions } from "./utils/pino.util";
import { env } from "./configs/env.config";
import { RedisModule } from "./redis/redis.module";
import { UserModule as AdminUserModule } from "./admin/user/user.module";
import { CommonModule } from "./common/common.module";
import { PostModule } from "./post/post.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [() => env],
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    CommonModule,
    UserModule,
    PostModule,
    AdminUserModule,
    LoggerModule.forRoot({ pinoHttp: pinoHttpOptions }),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
