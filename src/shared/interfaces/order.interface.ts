import { ProcessOrderDto } from "@/modules/order/dtos/create-order.dto";
import { GetOrderListDto } from "@/modules/order/dtos/get-order.dto";
import { Order } from "@prisma/client";

export interface IOrderService {
  // *************************** 소비자 API ***************************
  getOrdersByCustomer(userId: string, dto: GetOrderListDto): Promise<Order[]>;
  getOrderDetailByCustomer(userId: string, orderId: string): Promise<Order>;
  // *************************** 점주 API ***************************
  getOrdersByOwner(userId: string, dto: GetOrderListDto): Promise<Order[]>;
  getOrderDetailByOwner(userId: string, orderId: string): Promise<Order>;
  processOrder(orderId: string, dto: ProcessOrderDto): Promise<Order>;
}
