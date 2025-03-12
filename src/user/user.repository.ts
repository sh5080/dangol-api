import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateUserDto } from "./dtos/create-user.dto";
import { CheckUserValueType } from "../types/enum.type";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { v4 as uuidv4 } from "uuid";
@Injectable()
export class UserRepository {
  private readonly prisma: Prisma.TransactionClient;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prisma;
  }

  async create(dto: CreateUserDto) {
    return await this.prisma.user.create({ data: { id: uuidv4(), ...dto } });
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  async getUserWithBlocksByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email: email },
      // select: selectUserValidate(),
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

  async updatePassword(id: string, newPassword: string) {
    return await this.prisma.user.update({
      where: { id: id },
      data: { password: newPassword },
    });
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id: id },
      data: dto,
    });
  }

  async blockUser(id: string, reasonId: number) {
    return await this.prisma.userBlock.create({
      data: { userId: id, reasonId: reasonId },
    });
  }
}
