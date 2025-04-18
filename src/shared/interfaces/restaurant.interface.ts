import { Restaurant, RestaurantRequest } from "@dangol/core";

import { GetRestaurantListDto } from "@/modules/restaurant/dtos/get-restaurant.dto";
import {
  ProcessRestaurantRequestDto,
  RequestRestaurantDto,
} from "@/modules/restaurant/dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "@/modules/restaurant/dtos/update-restaurant.dto";
export interface IRestaurantService {
  // *************************** 공용 API ***************************
  getRestaurant(id: string): Promise<Restaurant>;
  getRestaurants(dto: GetRestaurantListDto): Promise<Restaurant[]>;
  // *************************** 점주 관련 API ***************************
  requestRestaurant(
    userId: string,
    dto: RequestRestaurantDto
  ): Promise<Restaurant>;
  getRestaurantRequests(userId: string): Promise<RestaurantRequest[]>;
  getMyRestaurants(userId: string): Promise<Restaurant[]>;
  updateMyRestaurant(id: string, dto: UpdateRestaurantDto): Promise<Restaurant>;
  // *************************** 관리자 관련 API ***************************
  processRestaurantRequest(
    id: number,
    dto: ProcessRestaurantRequestDto
  ): Promise<RestaurantRequest>;
  getAllRestaurantRequests(
    dto: GetRestaurantListDto
  ): Promise<RestaurantRequest[]>;
}
