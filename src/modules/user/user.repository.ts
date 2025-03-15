import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateUserDto } from "./dtos/create-user.dto";
import { CheckUserValueType } from "@shared/types/enum.type";
import { UpdateUserProfileDto } from "./dtos/update-user.dto";
import { v4 as uuidv4 } from "uuid";
import { userDetail } from "./queries/include.query";
@Injectable()
export class UserRepository {
  private readonly prisma: Prisma.TransactionClient;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prisma;
  }

  async createUser(dto: CreateUserDto, authProviderId: number) {
    const { authType, isEventAgree, nickname, ...user } = dto;

    return await this.prisma.user.create({
      data: {
        id: uuidv4(),
        ...user,
        authProviderId,
        profile: { create: { nickname } },
        events: { create: { eventId: 1, isAgreed: isEventAgree } },
      },
      include: userDetail,
    });
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email: email, deletedAt: null },
    });
  }

  async getUserProfileById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id: id, deletedAt: null },
      include: userDetail,
    });
  }
  async getChatParticipants(userIds: string[]) {
    return await this.prisma.user.findMany({
      where: { id: { in: userIds }, deletedAt: null },
      select: { profile: true },
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
  async checkUserNickname(nickname: string): Promise<boolean> {
    const existingCount = await this.prisma.user.count({
      where: { profile: { nickname: nickname }, deletedAt: null },
    });
    return existingCount > 0;
  }

  async updateUserProfile(id: string, dto: UpdateUserProfileDto) {
    return await this.prisma.user.update({
      where: { id: id, deletedAt: null },
      data: {
        profile: { update: { data: dto } },
      },
      include: userDetail,
    });
  }

  async blockUser(id: string, reasonId: number) {
    return await this.prisma.userBlock.create({
      data: { userId: id, reasonId: reasonId },
    });
  }
}
