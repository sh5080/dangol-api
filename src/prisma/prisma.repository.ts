import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CreateUserDto } from "../user/dtos/create-user.dto";

@Injectable()
export class PrismaRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async ensurePermission(name: string, description: string): Promise<void> {
    const permissionExists = await this.prisma.permission.findFirst({
      where: { name },
    });

    if (!permissionExists) {
      await this.prisma.permission.create({ data: { name, description } });
      console.log(`Permission "${name}" created successfully`);
    }
  }
  async ensureUser(
    dto: CreateUserDto,
    userId: string,
    authProviderId: number
  ): Promise<void> {
    const { authType, isEventAgree, ...user } = dto;

    const userExists = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!userExists) {
      await this.prisma.user.create({
        data: {
          id: userId,
          ...user,
          authProviderId,
          events: { create: { eventId: 1, isAgreed: isEventAgree } },
        },
        include: { profile: true, events: true },
      });
      console.log(`User "${userId}" created successfully`);
    }
  }
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

  async ensureBlockReason(description: string): Promise<void> {
    const blockReasonExists = await this.prisma.blockReason.findFirst({
      where: { description },
    });

    if (!blockReasonExists) {
      await this.prisma.blockReason.create({ data: { description } });
      console.log(`BlockReason "${description}" created successfully`);
    }
  }
}
