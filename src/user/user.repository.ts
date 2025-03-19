import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateUserDto } from "./dtos/create-user.dto";
import { CheckUserValueType } from "../types/enum.type";
import { UpdateUserProfileDto } from "./dtos/update-user.dto";
import { v4 as uuidv4 } from "uuid";
import { userDetail } from "./queries/include.query";
@Injectable()
export class UserRepository {
  private readonly prisma: Prisma.TransactionClient;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prisma;
  }

  async create(dto: CreateUserDto, authProviderId: number) {
    const {
      certificationCode,
      authType,
      isEventAgree,
      affiliation,
      nickname,
      class: className,
      ...user
    } = dto;

    return await this.prisma.user.create({
      data: {
        id: uuidv4(),
        ...user,
        authProviderId,
        events: { create: { eventId: 1, isAgreed: isEventAgree } },
        profile: { create: { affiliation, class: className, nickname } },
      },
      include: userDetail,
    });
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email: email },
      include: { role: true },
    });
  }

  async getUserProfileById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id: id },
      include: userDetail,
    });
  }

  async getUserWithBlocksByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id: id },
    });
  }

  async checkUserByValue(
    key: CheckUserValueType,
    value: string
  ): Promise<boolean> {
    const existingCount = await this.prisma.user.count({
      where: { [key]: value },
    });
    return existingCount > 0;
  }
  async checkUserNickname(nickname: string): Promise<boolean> {
    const existingCount = await this.prisma.user.count({
      where: { profile: { nickname: nickname } },
    });
    return existingCount > 0;
  }

  async updatePassword(id: string, newPassword: string) {
    return await this.prisma.user.update({
      where: { id: id },
      data: { password: newPassword },
    });
  }

  async updateUserProfile(id: string, dto: UpdateUserProfileDto) {
    return await this.prisma.user.update({
      where: { id: id },
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
