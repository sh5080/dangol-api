import { Injectable, NotFoundException } from "@nestjs/common";
import { IRestaurantService } from "@shared/interfaces/restaurant.interface";
import { RestaurantRepository } from "@/modules/restaurant/restaurant.repository";
import { GetRestaurantListDto } from "./dtos/get-restaurant.dto";
import { DefaultErrorMessage } from "@/shared/types/message.type";
import { RequestRestaurantDto } from "./dtos/create-restaurant.dto";

@Injectable()
export class RestaurantService implements IRestaurantService {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async getRestaurant(id: string) {
    const restaurant = await this.restaurantRepository.getRestaurant(id);
    if (!restaurant) {
      throw new NotFoundException(DefaultErrorMessage.NOT_FOUND);
    }
    return restaurant;
  }

  async getRestaurants(dto: GetRestaurantListDto) {
    const restaurants = await this.restaurantRepository.getRestaurants(dto);
    if (!restaurants || !restaurants.length) {
      throw new NotFoundException(DefaultErrorMessage.NOT_FOUND);
    }
    return restaurants;
  }

  async requestRestaurant(userId: string, dto: RequestRestaurantDto) {
    const restaurant = await this.restaurantRepository.requestRestaurant(
      userId,
      dto
    );
    if (!restaurant) {
      throw new NotFoundException(DefaultErrorMessage.NOT_FOUND);
    }
    return restaurant;
  }
}
