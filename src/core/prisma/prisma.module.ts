import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { EncryptionService } from "@shared/utils/encryption.util";
import { PrismaRepository } from "./prisma.repository";
import { PrismaClient } from "@prisma/client";
import { env } from "@shared/configs/env.config";

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: PrismaClient,
      useFactory: () =>
        new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } }),
    },
    PrismaRepository,
    EncryptionService,
  ],
  exports: [PrismaService, PrismaRepository],
})
export class PrismaModule {}
