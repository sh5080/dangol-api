import { Injectable } from "@nestjs/common";
import { IRestaurantService } from "@shared/interfaces/restaurant.interface";
import { RestaurantRepository } from "@/modules/restaurant/restaurant.repository";
import { GetRestaurantListDto } from "./dtos/get-restaurant.dto";
import {
  ProcessRestaurantRequestDto,
  RequestRestaurantDto,
} from "./dtos/create-restaurant.dto";
import { ExceptionUtil } from "@shared/utils/exception.util";

@Injectable()
export class RestaurantService implements IRestaurantService {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async getRestaurant(id: string) {
    const restaurant = await this.restaurantRepository.getRestaurant(id);
    ExceptionUtil.default(restaurant);
    return restaurant;
  }

  async getRestaurants(dto: GetRestaurantListDto) {
    const restaurants = await this.restaurantRepository.getRestaurants(dto);
    ExceptionUtil.emptyArray(restaurants);
    return restaurants;
  }

  async requestRestaurant(userId: string, dto: RequestRestaurantDto) {
    const restaurant = await this.restaurantRepository.requestRestaurant(
      userId,
      dto
    );
    ExceptionUtil.default(restaurant);
    return restaurant;
  }

  async getRestaurantRequests(userId: string) {
    const restaurantRequests =
      await this.restaurantRepository.getRestaurantRequests(userId);
    ExceptionUtil.emptyArray(restaurantRequests);
    return restaurantRequests;
  }

  async processRestaurantRequest(id: number, dto: ProcessRestaurantRequestDto) {
    const restaurantRequest =
      await this.restaurantRepository.processRestaurantRequest(
        id,
        dto.status,
        dto.rejectReason
      );
    ExceptionUtil.default(restaurantRequest);
    return restaurantRequest;
  }
}
