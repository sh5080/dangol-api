import {
  AuthModule as DangolAuthModule,
  AuthService as DangolAuthService,
  RedisService as DangolRedisService,
} from "@dangol/auth";

import { Module, Global } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UserRepository } from "../user/user.repository";
import { UserService } from "../user/user.service";
import { MailService } from "../mail/mail.service";
import { env } from "@shared/configs/env.config";

@Global()
@Module({
  imports: [
    DangolAuthModule.forRoot({
      redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
      },
      NODE_ENV: env.NODE_ENV,
      auth: {
        ACCESS_JWT_SECRET: env.ACCESS_JWT_SECRET,
        REFRESH_JWT_SECRET: env.REFRESH_JWT_SECRET,
        ACCESS_JWT_EXPIRATION: env.ACCESS_JWT_EXPIRATION,
        REFRESH_JWT_EXPIRATION: env.REFRESH_JWT_EXPIRATION,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    DangolAuthService,
    DangolRedisService,
    { provide: "IUserService", useClass: UserService },
    MailService,
    UserRepository,
    // EncryptionService,
  ],
  exports: [DangolAuthService, DangolRedisService],
})
export class AuthModule {}
