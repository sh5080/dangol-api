import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** 이벤트 존재 확인 및 생성 */
  async ensureEvent(name: string, description: string): Promise<void> {
    const eventExists = await this.prisma.event.findFirst({
      where: { name },
    });

    if (!eventExists) {
      await this.prisma.event.create({ data: { name, description } });
      console.log(`Event "${name}" created successfully`);
    }
  }

  /** 인증 제공자 존재 확인 및 생성 */
  async ensureAuthProvider(name: string): Promise<void> {
    const authProviderExists = await this.prisma.authProvider.findFirst({
      where: { name },
    });

    if (!authProviderExists) {
      await this.prisma.authProvider.create({ data: { name } });
      console.log(`AuthProvider "${name}" created successfully`);
    }
  }
}
