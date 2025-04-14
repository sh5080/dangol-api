import { Test, TestingModule } from "@nestjs/testing";
import { RestaurantController } from "../restaurant.controller";
import { RestaurantService } from "../restaurant.service";
import { RestaurantRepository } from "../restaurant.repository";
import { mockAuthGuard, mockAuthService } from "@/modules/auth/tests/auth.mock";
import { AuthGuard } from "@/modules/auth/guards/auth.guard";
import { mockMailService } from "@/modules/mail/tests/mail.mock";
import { MailService } from "@/modules/mail/mail.service";

export const mockRestaurantService = {
  getRestaurant: jest.fn(),
  getRestaurants: jest.fn(),
  requestRestaurant: jest.fn(),
  getRestaurantRequests: jest.fn(),
  getMyRestaurants: jest.fn(),
  processRestaurantRequest: jest.fn(),
};

export const mockRestaurantRepository = {
  getRestaurant: jest.fn(),
  getRestaurants: jest.fn(),
  requestRestaurant: jest.fn(),
  getUserRestaurantRequests: jest.fn(),
  getMyRestaurants: jest.fn(),
  processRestaurantRequest: jest.fn(),
  getMyRestaurant: jest.fn(),
  updateMyRestaurant: jest.fn(),
  getAllRestaurantRequests: jest.fn(),
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
      {
        provide: MailService,
        useValue: mockMailService,
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
      {
        provide: MailService,
        useValue: mockMailService,
      },
    ],
  }).compile();

  return module;
};
