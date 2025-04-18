import {
  Prisma,
  PrismaService,
  UserAgreementCategory,
  CheckUserValueType,
} from "@dangol/core";

import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { FindEmailDto } from "./dtos/get-user.dto";

@Injectable()
export class UserRepository {
  private readonly prisma: Prisma.TransactionClient;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prisma;
  }

  async createUser(dto: CreateUserDto) {
    const { isPersonalInfoCollectionAgree, isPersonalInfoUseAgree, ...user } =
      dto;

    return await this.prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        ...user,
        agreements: {
          create: [
            {
              category: UserAgreementCategory.PERSONAL_INFO_COLLECTION,
              isAgreed: isPersonalInfoCollectionAgree,
            },
            {
              category: UserAgreementCategory.PERSONAL_INFO_USE,
              isAgreed: isPersonalInfoUseAgree,
            },
          ],
        },
      },
    });
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email: email, deletedAt: null },
    });
  }

  async getChatParticipants(userIds: string[]) {
    return await this.prisma.user.findMany({
      where: { id: { in: userIds }, deletedAt: null },
    });
  }

  async getUserWithBlocksByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email: email, deletedAt: null },
    });
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id: id, deletedAt: null },
    });
  }

  async checkUserByValue(
    key: CheckUserValueType,
    value: string
  ): Promise<boolean> {
    const existingCount = await this.prisma.user.count({
      where: { [key]: value, deletedAt: null },
    });
    return existingCount > 0;
  }

  async blockUser(id: string, reasonId: number) {
    return await this.prisma.userBlock.create({
      data: { userId: id, reasonId: reasonId },
    });
  }

  async findEmail(dto: FindEmailDto) {
    const { name, phoneNumber } = dto;
    return await this.prisma.user.findUnique({
      where: { name, phoneNumber, deletedAt: null },
    });
  }

  async updatePassword(email: string, hashedPassword: string) {
    return await this.prisma.user.update({
      where: { email, deletedAt: null },
      data: { password: hashedPassword },
    });
  }
}
