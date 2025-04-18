import { Module, Global } from "@nestjs/common";
import { PrismaModule as DangolPrismaModule } from "@dangol/core";

@Global()
@Module({
  imports: [
    DangolPrismaModule.forRoot({
      databaseUrl: process.env.DATABASE_URL,
    }),
  ],
})
export class PrismaModule {}
