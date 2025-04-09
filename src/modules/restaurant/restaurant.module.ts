import { Module } from "@nestjs/common";
import { RestaurantController } from "./restaurant.controller";
import { RestaurantService } from "./restaurant.service";
import { RestaurantRepository } from "./restaurant.repository";
@Module({
  controllers: [RestaurantController],
  providers: [
    {
      provide: "IRestaurantService",
      useClass: RestaurantService,
    },
    RestaurantRepository,
  ],
})
export class RestaurantModule {}
