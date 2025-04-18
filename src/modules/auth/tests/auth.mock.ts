import { PrismaService } from "@dangol/core";
import { RedisService as DangolRedisService, AuthService } from "@dangol/auth";

import { AuthController } from "../auth.controller";
import { Test } from "@nestjs/testing";
import { mockUserService } from "@/modules/user/tests/user.mock";
import { mockRedis } from "@/core/redis/tests/redis.mock";
import { mockRedisService } from "@/core/redis/tests/redis.mock";
import { mockLogger } from "@/shared/tests/util.mock";
import { getRedisConnectionToken } from "@nestjs-modules/ioredis";
import { Logger } from "nestjs-pino";

export async function mockAuthModule() {
  return await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      {
        provide: AuthService,
        useValue: mockAuthService,
      },
    ],
  }).compile();
}

export async function mockAuthServiceModule() {
  return await Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: "IUserService",
        useValue: mockUserService,
      },
      {
        provide: getRedisConnectionToken("default"),
        useValue: mockRedis,
      },
      {
        provide: DangolRedisService,
        useValue: mockRedisService,
      },
      {
        provide: Logger,
        useValue: mockLogger,
      },
      {
        provide: PrismaService,
        useValue: PrismaService,
      },
    ],
  }).compile();
}
export const mockAuthService = {
  authenticate: jest.fn(),
  logout: jest.fn(),
  verify: jest.fn(),
  getBlacklist: jest.fn(),
  createTokens: jest.fn(),
  setBlacklist: jest.fn(),
};

export const mockAuthGuard = {
  canActivate: jest.fn().mockImplementation(() => true),
};
