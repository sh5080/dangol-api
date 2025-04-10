import { Test, TestingModule } from "@nestjs/testing";
import { RestaurantController } from "../restaurant.controller";
import { RestaurantService } from "../restaurant.service";
import { RestaurantRepository } from "../restaurant.repository";
import { mockAuthGuard, mockAuthService } from "@/modules/auth/tests/auth.mock";
import { AuthGuard } from "@/modules/auth/guards/auth.guard";

export const mockRestaurantService = {
  getRestaurant: jest.fn(),
  getRestaurants: jest.fn(),
  requestRestaurant: jest.fn(),
  getRestaurantRequests: jest.fn(),
  processRestaurantRequest: jest.fn(),
};

export const mockRestaurantRepository = {
  getRestaurant: jest.fn(),
  getRestaurants: jest.fn(),
  requestRestaurant: jest.fn(),
  getRestaurantRequests: jest.fn(),
  processRestaurantRequest: jest.fn(),
};

export const mockRestaurantModule = async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [RestaurantController],
    providers: [
      {
        provide: "IRestaurantService",
        useValue: mockRestaurantService,
      },
      {
        provide: "AuthService",
        useValue: mockAuthService,
      },
    ],
  })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard)
    .compile();

  return module;
};

export const mockRestaurantServiceModule = async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      RestaurantService,
      {
        provide: RestaurantRepository,
        useValue: mockRestaurantRepository,
      },
    ],
  }).compile();

  return module;
};
