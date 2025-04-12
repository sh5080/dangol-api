import { Module } from "@nestjs/common";
import { RestaurantController } from "./restaurant.controller";
import { RestaurantService } from "./restaurant.service";
import { RestaurantRepository } from "./restaurant.repository";
import { MailService } from "../mail/mail.service";
@Module({
  controllers: [RestaurantController],
  providers: [
    {
      provide: "IRestaurantService",
      useClass: RestaurantService,
    },
    MailService,
    RestaurantRepository,
  ],
})
export class RestaurantModule {}
