import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { EncryptionService } from "../utils/encryption.util";

@Global()
@Module({
  providers: [PrismaService, EncryptionService],
  exports: [PrismaService],
})
export class PrismaModule {}
