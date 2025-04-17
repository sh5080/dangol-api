import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { Prisma, UserAgreementCategory } from "@prisma/client";
import { CreateUserDto } from "./dtos/create-user.dto";
import { CheckUserValueType } from "@shared/types/enum.type";
import { v4 as uuidv4 } from "uuid";
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
        id: uuidv4(),
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
}
