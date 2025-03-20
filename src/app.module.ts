import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "@modules/auth/auth.module";
import { UserModule } from "@modules/user/user.module";
import { PrismaModule } from "@core/prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { GlobalExceptionFilter } from "@shared/middlewares/error.middleware";
import { ResponseInterceptor } from "@shared/interceptors/response.interceptor";
import { LoggerModule } from "nestjs-pino";
import { pinoHttpOptions } from "@shared/utils/pino.util";
import { env } from "@shared/configs/env.config";
import { RedisModule } from "@core/redis/redis.module";
import { CommonModule } from "@modules/common/common.module";
import { MetricsModule } from "@modules/metrics/metrics.module";
import { MetricsInterceptor } from "@shared/interceptors/metrics.interceptor";
import { RestaurantModule } from "./modules/restaurant/restaurant.module";

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
    LoggerModule.forRoot({ pinoHttp: pinoHttpOptions }),
    MetricsModule,
    RestaurantModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
})
export class AppModule {}
