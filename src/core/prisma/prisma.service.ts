import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Prisma, PrismaClient, User } from "@prisma/client";
import { EncryptionService } from "@shared/utils/encryption.util";
import { PrismaRepository } from "./prisma.repository";
import { promises as fs } from "fs";
import * as path from "path";
import { env } from "@shared/configs/env.config";

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
    const encryptUserData = async (data: any) => {
      return await encryption.encrypt(data, env.ENCRYPTION_KEY);
    };
    const decryptUserData = async (data: any) => {
      return await encryption.decrypt(data, env.ENCRYPTION_KEY);
    };

    this.prisma = this._prisma.$extends({
      model: {
        user: {
          async create(params: Prisma.UserCreateArgs) {
            if (params.data?.email) {
              params.data.email = await encryptUserData(params.data.email);
            }
            if (params.data?.phoneNumber) {
              params.data.phoneNumber = await encryptUserData(
                params.data.phoneNumber
              );
            }

            const user = await prismaInstance.user.create(params);
            if (user.email) {
              user.email = await decryptUserData(user.email);
            }
            if (user.phoneNumber) {
              user.phoneNumber = await decryptUserData(user.phoneNumber);
            }

            delete (user as any).password;
            return user;
          },
          async findUnique(params: Prisma.UserFindUniqueArgs) {
            if (params.where.email) {
              params.where.email = await encryptUserData(params.where.email);
            }
            if (params.where.phoneNumber) {
              params.where.phoneNumber = await encryptUserData(
                params.where.phoneNumber
              );
            }
            const result = await prismaInstance.user.findUnique(params);
            if (result && result.email) {
              result.email = await decryptUserData(result.email);
            }
            if (result && result.phoneNumber) {
              result.phoneNumber = await decryptUserData(result.phoneNumber);
            }
            return result;
          },
          async findFirst(params: Prisma.UserFindFirstArgs) {
            if (params.where?.email) {
              params.where.email = await encryptUserData(params.where.email);
            }
            const result = await prismaInstance.user.findFirst(params);
            if (result && result.email) {
              result.email = await decryptUserData(result.email);
            }
            if (result && result.phoneNumber) {
              result.phoneNumber = await decryptUserData(result.phoneNumber);
            }
            return result;
          },
          async findMany(params: Prisma.UserFindManyArgs) {
            if (params?.where?.email) {
              params.where.email = await encryptUserData(params.where.email);
            }
            const results = await prismaInstance.user.findMany(params);
            for (const result of results) {
              if (result.email) {
                result.email = await decryptUserData(result.email);
              }
              if (result.phoneNumber) {
                result.phoneNumber = await decryptUserData(result.phoneNumber);
              }
            }
            return results;
          },
          async count(params: Prisma.UserCountArgs) {
            if (params?.where?.email) {
              params.where.email = await encryptUserData(params.where.email);
            }
            return prismaInstance.user.count(params);
          },
          async update(params: Prisma.UserUpdateArgs) {
            if (params?.where?.email) {
              params.where.email = await encryptUserData(params.where.email);
            }
            if (params?.where?.phoneNumber) {
              params.where.phoneNumber = await encryptUserData(
                params.where.phoneNumber
              );
            }
            const result = await prismaInstance.user.update(params);
            if (result.email) {
              result.email = await decryptUserData(result.email);
            }
            if (result.phoneNumber) {
              result.phoneNumber = await decryptUserData(result.phoneNumber);
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
    await this.repository.ensureBlockReason("user reported");
    await this.repository.ensureBlockReason("other inquiries");
    await this.seedUsers();
  }

  async seedUsers() {
    const filePath = path.join(__dirname, "../../../test/data/user.json");
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
