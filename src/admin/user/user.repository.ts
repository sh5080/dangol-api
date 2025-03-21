import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { UpdateUserPermissionDto } from "./dtos/update-user.dto";
import { PaginationDto } from "../../common/dtos/common.dto";
import { userDetail } from "../../user/queries/include.query";
@Injectable()
export class UserRepository {
  private readonly prisma: Prisma.TransactionClient;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prisma;
  }
  async getUserList(dto: PaginationDto) {
    const { page, pageSize } = dto;
    return await this.prisma.user.findMany({
      where: { deletedAt: null },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: userDetail,
    });
  }

  async getUserDetail(id: string) {
    return await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: userDetail,
    });
  }
  async getUserPermissions(userId: string) {
    return await this.prisma.userPermission.findMany({
      where: { userId },
    });
  }
  async createUserPermission(dto: UpdateUserPermissionDto) {
    return await this.prisma.userPermission.create({
      data: { userId: dto.userId, permissionId: dto.permissionId },
    });
  }

  async deleteUserPermission(dto: UpdateUserPermissionDto) {
    const { userId, permissionId } = dto;
    return await this.prisma.userPermission.delete({
      where: { userId_permissionId: { userId, permissionId } },
    });
  }
}
