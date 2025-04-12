import { Controller, Inject, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from "@nestia/core";
import { GetRestaurantListDto } from "./dtos/get-restaurant.dto";
import { AuthGuard } from "../auth/guards/auth.guard";
import { IRestaurantService } from "@shared/interfaces/restaurant.interface";
import {
  ProcessRestaurantRequestDto,
  RequestRestaurantDto,
} from "./dtos/create-restaurant.dto";
import { AuthRequest } from "@/shared/types/request.type";
import { Roles } from "@/shared/decorators/access-control.decorator";
import { Role } from "@prisma/client";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";

@ApiTags("매장")
@Controller("restaurant")
export class RestaurantController {
  constructor(
    @Inject("IRestaurantService")
    private readonly restaurantService: IRestaurantService
  ) {}
  // *************************** 공용 API ***************************
  /**
   * @summary 매장 단건 조회 (공용)
   * @param id 매장 id
   * @returns 매장
   */
  @TypedRoute.Get(":id")
  async getRestaurant(@TypedParam("id") id: string) {
    return await this.restaurantService.getRestaurant(id);
  }
  /**
   * @summary 매장 목록 조회 (공용)
   * @param dto 매장 목록 조회 dto
   * @returns 매장 목록
   */
  @TypedRoute.Get()
  async getRestaurants(@TypedQuery() dto: GetRestaurantListDto) {
    return await this.restaurantService.getRestaurants(dto);
  }

  // *************************** 점주 관련 API ***************************
  /**
   * @summary 매장 생성 요청 (점주 / 관리자)
   * @security bearer
   * @param dto 매장 생성 요청 dto
   * @returns 매장 생성 요청
   */
  @TypedRoute.Post("owner/request")
  @UseGuards(AuthGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async requestRestaurant(
    @Req() req: AuthRequest,
    @TypedBody() dto: RequestRestaurantDto
  ) {
    const { userId } = req.user;
    return await this.restaurantService.requestRestaurant(userId, dto);
  }
  /**
   * @summary 매장 생성 요청 조회 (점주)
   * @security bearer
   * @returns 매장 생성 요청 목록
   */
  @TypedRoute.Get("owner/request")
  @UseGuards(AuthGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  async getRestaurantRequests(@Req() req: AuthRequest) {
    const { userId } = req.user;
    return await this.restaurantService.getRestaurantRequests(userId);
  }
  /**
   * @summary 내 매장 조회 (점주)
   * @security bearer
   * @returns 내 매장
   */
  @TypedRoute.Get("owner/my")
  @UseGuards(AuthGuard)
  @Roles(Role.OWNER)
  async getMyRestaurants(@Req() req: AuthRequest) {
    const { userId } = req.user;
    return await this.restaurantService.getMyRestaurants(userId);
  }
  /**
   * @summary 내 매장 수정 (점주)
   * @security bearer
   * @param id 매장 id
   * @param dto 매장 수정 dto
   * @returns 매장 수정 결과
   */
  @TypedRoute.Put("owner/my/:id")
  @UseGuards(AuthGuard)
  @Roles(Role.OWNER)
  async updateMyRestaurant(
    @TypedParam("id") id: string,
    @TypedBody() dto: UpdateRestaurantDto
  ) {
    return await this.restaurantService.updateMyRestaurant(id, dto);
  }

  // *************************** 관리자 관련 API ***************************

  /**
   * @summary 매장 생성 요청 목록 조회 (관리자) -- 추후 별도서버 분리할 경우 엔드포인트 admin.-.com/api/restaurant/request 로 변경예정
   * @security bearer
   * @param dto 매장 생성 요청 목록 조회 dto
   * @returns 매장 생성 요청 목록
   */
  @TypedRoute.Get("admin/request")
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  async getAllRestaurantRequests(@TypedQuery() dto: GetRestaurantListDto) {
    return await this.restaurantService.getAllRestaurantRequests(dto);
  }
  /**
   * @summary 매장 생성 요청 승인 / 거절 처리 (관리자) -- 엔드포인트 admin.-.com/api/restaurant/request/:id/process 로 변경예정
   * @security bearer
   * @param id 매장 생성 요청 id
   * @param dto 매장 생성 요청 승인 / 거절 처리 dto
   * @returns 매장 생성 요청 결과
   */
  @TypedRoute.Post("admin/request/:id/process")
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  async processRestaurantRequest(
    @TypedParam("id") id: number,
    @TypedBody() dto: ProcessRestaurantRequestDto
  ) {
    return await this.restaurantService.processRestaurantRequest(
      Number(id),
      dto
    );
  }
}
