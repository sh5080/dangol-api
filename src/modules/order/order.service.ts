import { HttpStatus, Injectable } from "@nestjs/common";
import { OrderRepository } from "./order.repository";
// import { FetchDeliveryService } from "../delivery/fetch-delivery.service";
import { ProcessOrderDto } from "./dtos/create-order.dto";
import { GetOrderListDto } from "./dtos/get-order.dto";
import { ExceptionUtil } from "@shared/utils/exception.util";
import { OrderStatus, DeliveryType, DeliveryStatus } from "@prisma/client";
import { UpdateOrderDeliveryDto } from "./dtos/update-order.dto";
import { OrderErrorMessage } from "@/shared/types/message.type";
@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository
    // private readonly fetchDeliveryService: FetchDeliveryService
  ) {}
  // *************************** 소비자 API ***************************
  async getOrdersByCustomer(customerId: string, dto: GetOrderListDto) {
    const orders = await this.orderRepository.getOrdersByCustomer(
      customerId,
      dto
    );
    ExceptionUtil.emptyArray(orders);
    ExceptionUtil.default(
      orders[0].customerId === customerId,
      OrderErrorMessage.ORDER_NOT_ACCESSIBLE,
      HttpStatus.FORBIDDEN
    );
    return orders;
  }

  async getOrderDetailByCustomer(customerId: string, orderId: string) {
    const order = await this.orderRepository.getOrderDetail(orderId);
    ExceptionUtil.default(order);
    ExceptionUtil.default(
      order.customerId === customerId,
      OrderErrorMessage.ORDER_NOT_ACCESSIBLE,
      HttpStatus.FORBIDDEN
    );
    return order;
  }
  // *************************** 점주 API ***************************
  async getOrdersByOwner(ownerId: string, dto: GetOrderListDto) {
    const orders = await this.orderRepository.getOrdersByOwner(ownerId, dto);
    ExceptionUtil.emptyArray(orders);
    ExceptionUtil.default(
      orders[0].restaurant.ownerId === ownerId,
      OrderErrorMessage.ORDER_NOT_ACCESSIBLE,
      HttpStatus.FORBIDDEN
    );
    return orders;
  }
  async getOrderDetailByOwner(ownerId: string, orderId: string) {
    const order = await this.orderRepository.getOrderDetail(orderId);
    ExceptionUtil.default(order);
    ExceptionUtil.default(
      order.restaurant.ownerId === ownerId,
      OrderErrorMessage.ORDER_NOT_ACCESSIBLE,
      HttpStatus.FORBIDDEN
    );
    return order;
  }

  async processOrder(orderId: string, dto: ProcessOrderDto) {
    if (dto.deliveryType === DeliveryType.DELIVERY) {
      // TODO: 배달대행사 매칭 API 호출
      //   const deliveryInfo = await this.fetchDeliveryService.matchRider({
      //     orderId,
      //     restaurantAddress: order.restaurant.address,
      //   });
      //   // 배달 정보 저장
      //   await this.orderRepository.updateOrderDelivery(orderId, {
      //   status: DeliveryStatus.DELIVERING,
      //     type: DeliveryType.DELIVERY,
      //     info: deliveryInfo,
      //   });
    } else if (dto.deliveryType === DeliveryType.SELF) {
      // 직접 배달인 경우
      const updateDto: UpdateOrderDeliveryDto = {
        status: DeliveryStatus.DELIVERING,
        type: DeliveryType.SELF,
      };
      await this.orderRepository.updateOrderDelivery(orderId, updateDto);
    }

    // 주문 상태 업데이트
    return await this.orderRepository.updateOrderStatus(
      orderId,
      OrderStatus.PROCESSING
    );
  }
}
