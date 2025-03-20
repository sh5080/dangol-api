import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { GetRestaurantListDto } from "./dtos/get-restaurant.dto";

@Injectable()
export class RestaurantRepository {
  private readonly prisma: Prisma.TransactionClient;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prisma;
  }

  async getRestaurant(id: string) {
    return await this.prisma.restaurant.findUnique({
      where: { id },
    });
  }

  async getRestaurants(dto: GetRestaurantListDto) {
    return await this.prisma.restaurant.findMany({
      skip: (dto.page - 1) * dto.pageSize,
      take: dto.pageSize,
    });
  }
}
