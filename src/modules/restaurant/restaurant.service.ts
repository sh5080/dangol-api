import { ExceptionUtil, RequestStatus, MailType } from "@dangol/core";

import { Injectable } from "@nestjs/common";
import { IRestaurantService } from "@shared/interfaces/restaurant.interface";
import { RestaurantRepository } from "@/modules/restaurant/restaurant.repository";
import { GetRestaurantListDto } from "./dtos/get-restaurant.dto";
import {
  ProcessRestaurantRequestDto,
  RequestRestaurantDto,
} from "./dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class RestaurantService implements IRestaurantService {
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly mailService: MailService
  ) {}
  // *************************** 공용 API ***************************
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
      await this.restaurantRepository.getUserRestaurantRequests(userId);
    ExceptionUtil.emptyArray(restaurantRequests);
    return restaurantRequests;
  }

  async getMyRestaurants(userId: string) {
    const restaurants =
      await this.restaurantRepository.getMyRestaurants(userId);
    ExceptionUtil.emptyArray(restaurants);
    return restaurants;
  }

  async updateMyRestaurant(id: string, dto: UpdateRestaurantDto) {
    const myRestaurant = await this.restaurantRepository.getMyRestaurant(id);
    ExceptionUtil.default(myRestaurant);

    const updatedRestaurant =
      await this.restaurantRepository.updateMyRestaurant(id, dto);
    ExceptionUtil.default(updatedRestaurant);
    return updatedRestaurant;
  }

  // *************************** 관리자 관련 API ***************************
  async getAllRestaurantRequests(dto: GetRestaurantListDto) {
    const restaurantRequests =
      await this.restaurantRepository.getAllRestaurantRequests(dto);
    ExceptionUtil.emptyArray(restaurantRequests);
    return restaurantRequests;
  }

  async processRestaurantRequest(id: number, dto: ProcessRestaurantRequestDto) {
    const restaurantRequest =
      await this.restaurantRepository.processRestaurantRequest(id, dto);
    ExceptionUtil.default(restaurantRequest);
    if (restaurantRequest.status === RequestStatus.APPROVED) {
      await this.mailService.sendMail(
        restaurantRequest.user.email,
        MailType.RESTAURANT_APPROVED
      );
    }
    return restaurantRequest;
  }
}
