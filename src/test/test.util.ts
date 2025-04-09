import { PrismaModule } from "../prisma/prisma.module";
import { PrismaClient } from "@prisma/client";
import { RedisModule } from "../redis/redis.module";
import { RedisModule as IoRedisModule } from "@nestjs-modules/ioredis";
import { RedisService } from "../redis/redis.service";
import { PrismaService } from "../prisma/prisma.service";
import { Provider, ModuleMetadata } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { mockUser } from "./mocks/user.mock";
import { MockProxy, mock } from "jest-mock-extended";
import { LoggerModule } from "nestjs-pino";
import { pinoHttpOptions } from "../utils/pino.util";

// 모킹된 PrismaClient 생성
export const mockPrismaClient: MockProxy<PrismaClient> = mock<PrismaClient>();

// 모킹 초기화 함수
export function setupMocks() {
  mockPrismaClient.user.create = jest.fn().mockResolvedValue(mockUser);
  mockPrismaClient.user.findUnique = jest.fn().mockResolvedValue(mockUser);
  mockPrismaClient.user.findUniqueOrThrow = jest
    .fn()
    .mockResolvedValue(mockUser);
  mockPrismaClient.user.findFirst = jest.fn().mockResolvedValue(mockUser);
  mockPrismaClient.user.findFirstOrThrow = jest
    .fn()
    .mockResolvedValue(mockUser);
  mockPrismaClient.user.findMany = jest.fn().mockResolvedValue([mockUser]);
  mockPrismaClient.user.update = jest.fn().mockResolvedValue(mockUser);
  mockPrismaClient.user.updateMany = jest.fn().mockResolvedValue({ count: 1 });
  mockPrismaClient.user.upsert = jest.fn().mockResolvedValue(mockUser);
  mockPrismaClient.user.delete = jest.fn().mockResolvedValue(mockUser);
  mockPrismaClient.user.deleteMany = jest.fn().mockResolvedValue({ count: 1 });
  // mockPrismaClient.user.count = jest.fn().mockResolvedValue(1);
  mockPrismaClient.user.aggregate = jest.fn().mockResolvedValue({} as any);
  mockPrismaClient.user.groupBy = jest.fn().mockResolvedValue([]);
}

// 모킹 초기화 및 리셋 함수
export function resetMocks() {
  jest.clearAllMocks();
  setupMocks();
}

setupMocks();

// PrismaService 모킹
export const mockPrismaService = { prisma: mockPrismaClient };

const baseProviders: Provider[] = [
  {
    provide: PrismaService,
    useValue: mockPrismaService,
  },
  PrismaModule,
  RedisModule,
  {
    provide: "default_IORedisModuleConnectionToken",
    useValue: IoRedisModule,
  },
  RedisService,
];

/**
 * 테스트 모듈 생성 함수
 * @param metadata 테스트 모듈 메타데이터
 * @returns 컴파일된 테스트 모듈
 */
export async function createTestingModule(
  metadata: ModuleMetadata
): Promise<TestingModule> {
  const providers = [...baseProviders, ...(metadata.providers || [])];

  return Test.createTestingModule({
    imports: [
      LoggerModule.forRoot({ pinoHttp: pinoHttpOptions }),
      ...(metadata.imports || []),
    ],
    controllers: metadata.controllers || [],
    providers,
    exports: metadata.exports || [],
  }).compile();
}
