import { Prisma, PrismaService, OrderStatus } from "@dangol/core";
import { Injectable } from "@nestjs/common";
import { GetOrderListDto } from "./dtos/get-order.dto";
import { UpdateOrderDeliveryDto } from "./dtos/update-order.dto";
@Injectable()
export class OrderRepository {
  private readonly prisma: Prisma.TransactionClient;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prisma;
  }

  async getOrdersByCustomer(customerId: string, dto: GetOrderListDto) {
    const { page, pageSize, status } = dto;
    return await this.prisma.order.findMany({
      where: { status: status, customerId: customerId },
      include: { restaurant: true, customer: true, menus: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });
  }

  async getOrdersByOwner(ownerId: string, dto: GetOrderListDto) {
    const { page, pageSize, status } = dto;
    return await this.prisma.order.findMany({
      where: { status: status, restaurant: { ownerId: ownerId } },
      include: { restaurant: true, customer: true, menus: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });
  }

  async getOrderDetail(orderId: string) {
    return await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
        customer: true,
        menus: { include: { menu: true } },
      },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    return await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        restaurant: true,
        customer: true,
        menus: true,
      },
    });
  }

  async updateOrderDelivery(orderId: string, dto: UpdateOrderDeliveryDto) {
    const { status, type } = dto;
    return await this.prisma.orderDelivery.update({
      where: { id: orderId },
      data: { status, type },
    });
  }
}
