import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Prisma, PrismaClient, User } from "@prisma/client";
import { EncryptionService } from "../utils/encryption.util";
import { PrismaRepository } from "./prisma.repository";
import { promises as fs } from "fs";
import * as path from "path";
import { env } from "../configs/env.config";

type ExtendedPrismaClient = PrismaClient & {
  user: {
    create: (params: Prisma.UserCreateInput) => Promise<User>;
    findUnique: (params: Prisma.UserFindUniqueArgs) => Promise<User | null>;
    findFirst: (params: Prisma.UserFindFirstArgs) => Promise<User | null>;
    findMany: (params: Prisma.UserFindManyArgs) => Promise<User[]>;
    count: (params: Prisma.UserCountArgs) => Promise<number>;
  };
};

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private _prisma: PrismaClient;
  public prisma: ExtendedPrismaClient;

  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly repository: PrismaRepository
  ) {
    this._prisma = new PrismaClient({
      datasources: {
        db: { url: env.DATABASE_URL },
      },
    });
    const encryption = this.encryptionService;
    const prismaInstance = this._prisma;

    this.prisma = this._prisma.$extends({
      model: {
        user: {
          async create(params: Prisma.UserCreateArgs) {
            const { data } = params;

            if (data.email) {
              data.email = await encryption.encrypt(
                data.email,
                env.ENCRYPTION_KEY
              );
            }
            if (data.phoneNumber) {
              data.phoneNumber = await encryption.encrypt(
                data.phoneNumber,
                env.ENCRYPTION_KEY
              );
            }

            const user = await prismaInstance.user.create(params);
            user.email = await encryption.decrypt(
              user.email,
              env.ENCRYPTION_KEY
            );

            user.phoneNumber = await encryption.decrypt(
              user.phoneNumber,
              env.ENCRYPTION_KEY
            );

            delete (user as any).password;
            return user;
          },
          async findUnique(params: Prisma.UserFindUniqueArgs) {
            if (params.where.email) {
              params.where.email = await encryption.encrypt(
                params.where.email,
                env.ENCRYPTION_KEY
              );
            }
            const result = await prismaInstance.user.findUnique(params);
            if (result && result.email) {
              result.email = await encryption.decrypt(
                result.email,
                env.ENCRYPTION_KEY
              );
            }
            if (result && result.phoneNumber) {
              result.phoneNumber = await encryption.decrypt(
                result.phoneNumber,
                env.ENCRYPTION_KEY
              );
            }
            return result;
          },
          async findFirst(params: Prisma.UserFindFirstArgs) {
            if (params.where?.email) {
              params.where.email = await encryption.encrypt(
                params.where.email as string,
                env.ENCRYPTION_KEY
              );
            }
            const result = await prismaInstance.user.findFirst(params);
            if (result && result.email) {
              result.email = await encryption.decrypt(
                result.email,
                env.ENCRYPTION_KEY
              );
            }
            if (result && result.phoneNumber) {
              result.phoneNumber = await encryption.decrypt(
                result.phoneNumber,
                env.ENCRYPTION_KEY
              );
            }
            return result;
          },
          async findMany(params: Prisma.UserFindManyArgs) {
            if (params?.where?.email) {
              params.where.email = await encryption.encrypt(
                params.where.email as string,
                env.ENCRYPTION_KEY
              );
            }
            const results = await prismaInstance.user.findMany(params);
            for (const result of results) {
              if (result.email) {
                result.email = await encryption.decrypt(
                  result.email,
                  env.ENCRYPTION_KEY
                );
              }
              if (result.phoneNumber) {
                result.phoneNumber = await encryption.decrypt(
                  result.phoneNumber,
                  env.ENCRYPTION_KEY
                );
              }
            }
            return results;
          },
          async count(params: Prisma.UserCountArgs) {
            if (params?.where?.email) {
              params.where.email = await encryption.encrypt(
                params.where.email as string,
                env.ENCRYPTION_KEY
              );
            }
            return prismaInstance.user.count(params);
          },
          async update(params: Prisma.UserUpdateArgs) {
            const { data } = params;

            const result = await prismaInstance.user.update(params);
            if (result.email) {
              result.email = await encryption.decrypt(
                result.email,
                env.ENCRYPTION_KEY
              );
            }
            if (result.phoneNumber) {
              result.phoneNumber = await encryption.decrypt(
                result.phoneNumber,
                env.ENCRYPTION_KEY
              );
            }
            delete (result as any).password;
            return result;
          },
        },
      },
    }) as unknown as ExtendedPrismaClient;
  }
  async onModuleInit() {
    await this._prisma.$connect();
    console.log("Database connected successfully");
    await this.seedInitialData();
    console.log("Initial data seeded successfully");
  }
  /** 초기 데이터 시딩 */
  private async seedInitialData() {
    await this.repository.ensureEvent(
      "이벤트 수신동의",
      "마케팅 및 이벤트 정보 수신에 동의합니다."
    );
    await this.repository.ensureAuthProvider("NUCODE");
    await this.repository.ensureAuthProvider("KAKAO");
    await this.repository.ensureAuthProvider("GOOGLE");
    await this.repository.ensureAuthProvider("NAVER");
    await this.repository.ensureAuthProvider("NUCODE+KAKAO");
    await this.repository.ensureAuthProvider("NUCODE+GOOGLE");
    await this.repository.ensureAuthProvider("NUCODE+NAVER");
    await this.repository.ensureBlockReason("password mistake");
    await this.repository.ensureBlockReason("user reported");
    await this.repository.ensureBlockReason("other inquiries");
    await this.seedUsers();
  }

  async seedUsers() {
    const filePath = path.join(__dirname, "../../data/test-user.json");
    const data = await fs.readFile(filePath, "utf-8");
    const users = JSON.parse(data);

    for (const user of users) {
      await this.repository.ensureUser(user, user.id, 1);
    }
  }

  async onModuleDestroy() {
    await this._prisma.$disconnect();
  }
}
