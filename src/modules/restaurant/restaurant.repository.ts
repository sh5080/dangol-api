import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { Prisma, RestaurantStatus } from "@prisma/client";
import { GetRestaurantListDto } from "./dtos/get-restaurant.dto";
import {
  ProcessRestaurantRequestDto,
  RequestRestaurantDto,
} from "./dtos/create-restaurant.dto";
import { v4 as uuidv4 } from "uuid";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";
@Injectable()
export class RestaurantRepository {
  private readonly prisma: Prisma.TransactionClient;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prisma;
  }

  async getRestaurant(id: string) {
    return await this.prisma.restaurant.findUnique({
      where: { id, status: { not: RestaurantStatus.HIDDEN } },
    });
  }

  async getRestaurants(dto: GetRestaurantListDto) {
    return await this.prisma.restaurant.findMany({
      where: { status: { not: RestaurantStatus.HIDDEN } },
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
        businessLicenseImageUrl: dto.businessLicenseImageUrl,
        businessLicenseNumber: dto.businessLicenseNumber,
        address: dto.address,
        phoneNumber: dto.phoneNumber,
        owner: { connect: { userId: userId } },
        restaurantRequest: { create: { userId: userId } },
      },
    });
  }

  async getRestaurantRequests(userId: string) {
    return await this.prisma.restaurantRequest.findMany({
      where: { userId },
    });
  }

  async getMyRestaurants(userId: string) {
    return await this.prisma.restaurant.findMany({
      where: { owner: { userId }, status: { not: RestaurantStatus.HIDDEN } },
    });
  }

  async updateMyRestaurant(id: string, dto: UpdateRestaurantDto) {
    return await this.prisma.restaurant.update({
      where: { id },
      data: dto,
    });
  }
  async processRestaurantRequest(id: number, dto: ProcessRestaurantRequestDto) {
    return await this.prisma.restaurantRequest.update({
      where: { id },
      data: { status: dto.status, rejectReason: dto.rejectReason },
    });
  }
}
