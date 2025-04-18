import { Prisma, PrismaService, RestaurantStatus } from "@dangol/core";

import { Injectable } from "@nestjs/common";
import { GetRestaurantListDto } from "./dtos/get-restaurant.dto";
import {
  ProcessRestaurantRequestDto,
  RequestRestaurantDto,
} from "./dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";
@Injectable()
export class RestaurantRepository {
  private readonly prisma: Prisma.TransactionClient;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prisma;
  }

  async getRestaurant(id: string) {
    return await this.prisma.restaurant.findUnique({
      where: {
        id,
        status: {
          notIn: [RestaurantStatus.HIDDEN, RestaurantStatus.REQUESTED],
        },
      },
    });
  }

  async getRestaurants(dto: GetRestaurantListDto) {
    return await this.prisma.restaurant.findMany({
      where: {
        status: {
          notIn: [RestaurantStatus.HIDDEN, RestaurantStatus.REQUESTED],
        },
      },
      skip: (dto.page - 1) * dto.pageSize,
      take: dto.pageSize,
    });
  }

  async requestRestaurant(userId: string, dto: RequestRestaurantDto) {
    return await this.prisma.restaurant.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        description: dto.description,
        businessLicenseImageUrl: dto.businessLicenseImageUrl,
        businessLicenseNumber: dto.businessLicenseNumber,
        address: dto.address,
        phoneNumber: dto.phoneNumber,
        owner: { connect: { id: userId } },
        request: { create: { userId: userId } },
      },
    });
  }

  async getUserRestaurantRequests(userId: string) {
    return await this.prisma.restaurantRequest.findMany({
      where: { userId },
    });
  }

  async getAllRestaurantRequests(dto: GetRestaurantListDto) {
    return await this.prisma.restaurantRequest.findMany({
      include: {
        user: true,
        restaurant: true,
      },
      skip: (dto.page - 1) * dto.pageSize,
      take: dto.pageSize,
    });
  }
  async getMyRestaurant(id: string) {
    return await this.prisma.restaurant.findUnique({
      where: { id, status: { not: RestaurantStatus.REQUESTED } },
    });
  }

  async getMyRestaurants(userId: string) {
    return await this.prisma.restaurant.findMany({
      where: { ownerId: userId, status: { not: RestaurantStatus.REQUESTED } },
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
      include: { user: true },
    });
  }
}
