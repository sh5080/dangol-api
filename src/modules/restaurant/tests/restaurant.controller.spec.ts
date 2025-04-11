import { RestaurantController } from "../restaurant.controller";
import { IRestaurantService } from "@shared/interfaces/restaurant.interface";
import { GetRestaurantListDto } from "../dtos/get-restaurant.dto";
import {
  ProcessRestaurantRequestDto,
  RequestRestaurantDto,
} from "../dtos/create-restaurant.dto";
import { AuthRequest } from "@shared/types/request.type";
import { RequestStatus } from "@prisma/client";
import { mockRestaurantModule, mockRestaurantService } from "./restaurant.mock";

describe("RestaurantController", () => {
  let controller: RestaurantController;
  let restaurantService: IRestaurantService;

  beforeEach(async () => {
    const module = await mockRestaurantModule();

    controller = module.get<RestaurantController>(RestaurantController);
    restaurantService = module.get<IRestaurantService>("IRestaurantService");
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getRestaurant", () => {
    it("식당 ID로 단일 식당 조회 시 식당 정보를 반환해야 함", async () => {
      const restaurantId = "test-id";
      const mockRestaurant = {
        id: restaurantId,
        name: "테스트 식당",
        address: "테스트 주소",
        phoneNumber: "010-1234-5678",
      };

      mockRestaurantService.getRestaurant.mockResolvedValue(mockRestaurant);

      const result = await controller.getRestaurant(restaurantId);

      expect(restaurantService.getRestaurant).toHaveBeenCalledWith(
        restaurantId
      );
      expect(result).toEqual(mockRestaurant);
    });
  });

  describe("getRestaurants", () => {
    it("식당 목록 조회 시 식당 목록을 반환해야 함", async () => {
      const dto: GetRestaurantListDto = { page: 1, pageSize: 10 };
      const mockRestaurants = [
        { id: "test-id-1", name: "테스트 식당 1" },
        { id: "test-id-2", name: "테스트 식당 2" },
      ];

      mockRestaurantService.getRestaurants.mockResolvedValue(mockRestaurants);

      const result = await controller.getRestaurants(dto);

      expect(restaurantService.getRestaurants).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockRestaurants);
    });
  });

  describe("requestRestaurant", () => {
    it("식당 생성 요청 시 생성된 식당 정보를 반환해야 함", async () => {
      const req = { user: { userId: "user-id" } } as AuthRequest;
      const dto: RequestRestaurantDto = {
        name: "테스트 식당",
        description: "테스트 설명",
        address: "테스트 주소",
        phoneNumber: "010-1234-5678",
        businessLicenseImageUrl: "test-image-url",
        businessLicenseNumber: "test-business-license-number",
      };
      const mockRestaurant = {
        id: "new-id",
        name: dto.name,
        description: dto.description,
        address: dto.address,
        phoneNumber: dto.phoneNumber,
        businessLicenseImageUrl: dto.businessLicenseImageUrl,
        businessLicenseNumber: dto.businessLicenseNumber,
      };

      mockRestaurantService.requestRestaurant.mockResolvedValue(mockRestaurant);

      const result = await controller.requestRestaurant(req, dto);

      expect(restaurantService.requestRestaurant).toHaveBeenCalledWith(
        "user-id",
        dto
      );
      expect(result).toEqual(mockRestaurant);
    });
  });

  describe("getRestaurantRequests", () => {
    it("식당 생성 요청 목록 조회 시 요청 목록을 반환해야 함", async () => {
      const req = { user: { userId: "user-id" } } as AuthRequest;
      const mockRequests = [
        { id: 1, status: RequestStatus.PENDING },
        { id: 2, status: RequestStatus.APPROVED },
      ];

      mockRestaurantService.getRestaurantRequests.mockResolvedValue(
        mockRequests
      );

      const result = await controller.getRestaurantRequests(req);

      expect(restaurantService.getRestaurantRequests).toHaveBeenCalledWith(
        "user-id"
      );
      expect(result).toEqual(mockRequests);
    });
  });

  describe("getMyRestaurants", () => {
    it("내 식당 조회 시 내 식당 목록을 반환해야 함", async () => {
      const req = { user: { userId: "user-id" } } as AuthRequest;
      const mockRestaurants = [
        { id: "test-id-1", name: "테스트 식당 1" },
        { id: "test-id-2", name: "테스트 식당 2" },
      ];

      mockRestaurantService.getMyRestaurants.mockResolvedValue(mockRestaurants);

      const result = await controller.getMyRestaurants(req);

      expect(restaurantService.getMyRestaurants).toHaveBeenCalledWith(
        "user-id"
      );
      expect(result).toEqual(mockRestaurants);
    });
  });

  describe("processRestaurantRequest", () => {
    it("식당 생성 요청 처리 시 처리 결과를 반환해야 함", async () => {
      const requestId = 1;
      const dto: ProcessRestaurantRequestDto = {
        status: RequestStatus.APPROVED,
        rejectReason: undefined,
      };
      const mockResult = {
        id: requestId,
        status: RequestStatus.APPROVED,
        rejectReason: undefined,
      };

      mockRestaurantService.processRestaurantRequest.mockResolvedValue(
        mockResult
      );

      const result = await controller.processRestaurantRequest(requestId, dto);

      expect(restaurantService.processRestaurantRequest).toHaveBeenCalledWith(
        requestId,
        dto
      );
      expect(result).toEqual(mockResult);
    });
  });
});
