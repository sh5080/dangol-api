import { Controller, Inject, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from "@nestia/core";
import { GetRestaurantListDto } from "./dtos/get-restaurant.dto";
import { AuthGuard } from "../auth/guards/auth.guard";
import { IRestaurantService } from "@shared/interfaces/restaurant.interface";
import { RequestRestaurantDto } from "./dtos/create-restaurant.dto";
import { AuthRequest } from "@/shared/types/request.type";

@ApiTags("식당")
@Controller("restaurant")
export class RestaurantController {
  constructor(
    @Inject("IRestaurantService")
    private readonly restaurantService: IRestaurantService
  ) {}
  /**
   * @summary 식당 단건 조회
   * @param id 식당 id
   * @returns 식당
   */
  @TypedRoute.Get(":id")
  async getRestaurant(@TypedParam("id") id: string) {
    return this.restaurantService.getRestaurant(id);
  }
  /**
   * @summary 식당 목록 조회
   * @security bearer
   * @param dto 식당 목록 조회 dto
   * @returns 식당 목록
   */
  @TypedRoute.Get()
  @UseGuards(AuthGuard)
  async getRestaurants(@TypedQuery() dto: GetRestaurantListDto) {
    return this.restaurantService.getRestaurants(dto);
  }

  /**
   * @summary 식당 생성 요청
   * @param dto 식당 생성 요청 dto
   * @returns 식당 생성 요청
   */
  @TypedRoute.Post()
  @UseGuards(AuthGuard)
  async requestRestaurant(
    @Req() req: AuthRequest,
    @TypedBody() dto: RequestRestaurantDto
  ) {
    const { userId } = req.user;
    return this.restaurantService.requestRestaurant(userId, dto);
  }
}
