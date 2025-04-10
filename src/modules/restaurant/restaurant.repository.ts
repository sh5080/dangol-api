import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { GetRestaurantListDto } from "./dtos/get-restaurant.dto";
import { RequestRestaurantDto } from "./dtos/create-restaurant.dto";
import { v4 as uuidv4 } from "uuid";
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

  async requestRestaurant(userId: string, dto: RequestRestaurantDto) {
    return await this.prisma.restaurant.create({
      data: {
        id: uuidv4(),
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        address: dto.address,
        phoneNumber: dto.phoneNumber,
        owner: { connect: { userId: userId } },
        restaurantRequest: { create: { userId: userId } },
      },
    });
  }
}
