import { AuthRequest, Role } from "@dangol/core";
import { AuthGuard, Roles } from "@dangol/auth";

import { Controller, Req, UseGuards, Inject } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from "@nestia/core";
import { GetOrderListDto } from "./dtos/get-order.dto";
import { ProcessOrderDto } from "./dtos/create-order.dto";
import { IOrderService } from "@shared/interfaces/order.interface";
@ApiTags("주문")
@Controller("order")
export class OrderController {
  constructor(
    @Inject("IOrderService")
    private readonly orderService: IOrderService
  ) {}

  // *************************** 소비자 API ***************************
  /**
   * @summary 주문 목록 조회 (소비자)
   * @security bearer
   * @param dto 주문 목록 조회 dto
   * @returns 주문 목록
   */
  @TypedRoute.Get("customer")
  @UseGuards(AuthGuard)
  @Roles(Role.CUSTOMER)
  async getOrdersByCustomer(
    @Req() req: AuthRequest,
    @TypedQuery() dto: GetOrderListDto
  ) {
    const { userId } = req.user;
    return await this.orderService.getOrdersByCustomer(userId, dto);
  }

  /**
   * @summary 주문 상세 조회 (소비자)
   * @security bearer
   * @param id 주문 id
   * @returns 주문 상세
   */
  @TypedRoute.Get("customer/:id")
  @UseGuards(AuthGuard)
  @Roles(Role.CUSTOMER)
  async getOrderDetail(@Req() req: AuthRequest, @TypedParam("id") id: string) {
    const { userId } = req.user;
    return await this.orderService.getOrderDetailByCustomer(userId, id);
  }

  // *************************** 점주 API ***************************
  /**
   * @summary 주문 목록 조회 (점주)
   * @security bearer
   * @param dto 주문 목록 조회 dto
   * @returns 주문 목록
   */
  @TypedRoute.Get("owner")
  @UseGuards(AuthGuard)
  @Roles(Role.OWNER)
  async getOrdersByOwner(
    @Req() req: AuthRequest,
    @TypedQuery() dto: GetOrderListDto
  ) {
    const { userId } = req.user;
    return await this.orderService.getOrdersByOwner(userId, dto);
  }

  /**
   * @summary 주문 상세 조회 (점주)
   * @security bearer
   * @param id 주문 id
   * @returns 주문 상세
   */
  @TypedRoute.Get("owner/:id")
  @UseGuards(AuthGuard)
  @Roles(Role.OWNER)
  async getOrderDetailByOwner(
    @Req() req: AuthRequest,
    @TypedParam("id") id: string
  ) {
    const { userId } = req.user;
    return await this.orderService.getOrderDetailByOwner(userId, id);
  }
  /**
   * @summary 주문 처리 (점주)
   * @security bearer
   * @param id 주문 id
   * @param dto 주문 처리 dto
   * @returns 주문 처리 결과
   */
  @TypedRoute.Post("owner/:id/process")
  async processOrder(
    @TypedParam("id") id: string,
    @TypedBody() dto: ProcessOrderDto
  ) {
    return await this.orderService.processOrder(id, dto);
  }
}
