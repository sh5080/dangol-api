import {
  pinoHttpOptions,
  GlobalExceptionFilter,
  ResponseInterceptor,
  MetricsInterceptor,
  MetricsModule,
} from "@dangol/core";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { env } from "@shared/configs/env.config";

import { AppController } from "./app.controller";
import { AuthModule } from "@modules/auth/auth.module";
import { UserModule } from "@modules/user/user.module";
import { PrismaModule } from "@core/prisma/prisma.module";
import { RestaurantModule } from "./modules/restaurant/restaurant.module";
import { OrderModule } from "./modules/order/order.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [() => env],
      isGlobal: true,
    }),
    LoggerModule.forRoot({ pinoHttp: pinoHttpOptions }),
    PrismaModule,
    AuthModule,
    UserModule,
    RestaurantModule,
    OrderModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
})
export class AppModule {}
