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
}
