import { Restaurant, RestaurantRequest } from "@prisma/client";
import { GetRestaurantListDto } from "@/modules/restaurant/dtos/get-restaurant.dto";
import {
  ProcessRestaurantRequestDto,
  RequestRestaurantDto,
} from "@/modules/restaurant/dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "@/modules/restaurant/dtos/update-restaurant.dto";
export interface IRestaurantService {
  getRestaurant(id: string): Promise<Restaurant>;
  getRestaurants(dto: GetRestaurantListDto): Promise<Restaurant[]>;
  requestRestaurant(
    userId: string,
    dto: RequestRestaurantDto
  ): Promise<Restaurant>;
  getRestaurantRequests(userId: string): Promise<RestaurantRequest[]>;
  getMyRestaurants(userId: string): Promise<Restaurant[]>;
  updateMyRestaurant(id: string, dto: UpdateRestaurantDto): Promise<Restaurant>;
  processRestaurantRequest(
    id: number,
    dto: ProcessRestaurantRequestDto
  ): Promise<RestaurantRequest>;
}
