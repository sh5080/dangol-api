import { Restaurant } from "@prisma/client";
import { GetRestaurantListDto } from "@/modules/restaurant/dtos/get-restaurant.dto";

export interface IRestaurantService {
  getRestaurant(id: string): Promise<Restaurant>;
  getRestaurants(dto: GetRestaurantListDto): Promise<Restaurant[]>;
}
