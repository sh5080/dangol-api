import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { GetUserListDto } from "./dtos/get-user.dto";
@Injectable()
export class UserRepository {
  private readonly prisma: Prisma.TransactionClient;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prisma;
  }
  async getUserList(dto: GetUserListDto) {
    const { page, pageSize } = dto;
    return await this.prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }
}
