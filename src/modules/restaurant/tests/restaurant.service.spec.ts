import { RestaurantService } from "../restaurant.service";
import { NotFoundException } from "@nestjs/common";
import { RequestStatus } from "@prisma/client";
import { ExceptionUtil } from "@shared/utils/exception.util";
import {
  mockRestaurantServiceModule,
  mockRestaurantRepository,
} from "./restaurant.mock";
import { mockMailService } from "@/modules/mail/tests/mail.mock";
import { MailType } from "@/shared/types/enum.type";
import { UpdateRestaurantDto } from "../dtos/update-restaurant.dto";

describe("RestaurantService", () => {
  let service: RestaurantService;

  beforeEach(async () => {
    const module = await mockRestaurantServiceModule();

    service = module.get<RestaurantService>(RestaurantService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getRestaurant", () => {
    it("매장이 존재하면 매장 정보를 반환해야 함", async () => {
      const restaurantId = "test-id";
      const mockRestaurant = {
        id: restaurantId,
        name: "테스트 매장",
        address: "테스트 주소",
        phoneNumber: "010-1234-5678",
      };

      mockRestaurantRepository.getRestaurant.mockResolvedValue(mockRestaurant);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      const result = await service.getRestaurant(restaurantId);

      expect(mockRestaurantRepository.getRestaurant).toHaveBeenCalledWith(
        restaurantId
      );

      expect(result).toEqual(mockRestaurant);
      expect(ExceptionUtil.default).toHaveBeenCalledWith(mockRestaurant);
    });

    it("매장이 존재하지 않으면 NotFoundException을 호출해야 함", async () => {
      const restaurantId = "nonexistent-id";
      mockRestaurantRepository.getRestaurant.mockResolvedValue(null);

      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(service.getRestaurant(restaurantId)).rejects.toThrow(
        NotFoundException
      );
      expect(mockRestaurantRepository.getRestaurant).toHaveBeenCalledWith(
        restaurantId
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(null);
    });
  });

  describe("getRestaurants", () => {
    it("매장 목록이 존재하면 매장 목록을 반환해야 함", async () => {
      const dto = { page: 1, pageSize: 10 };
      const mockRestaurants = [
        { id: "test-id-1", name: "테스트 매장 1" },
        { id: "test-id-2", name: "테스트 매장 2" },
      ];

      mockRestaurantRepository.getRestaurants.mockResolvedValue(
        mockRestaurants
      );
      jest.spyOn(ExceptionUtil, "emptyArray").mockImplementation(() => {});

      const result = await service.getRestaurants(dto);

      expect(mockRestaurantRepository.getRestaurants).toHaveBeenCalledWith(dto);
      expect(ExceptionUtil.emptyArray).toHaveBeenCalledWith(mockRestaurants);
      expect(result).toEqual(mockRestaurants);
    });

    it("매장 목록이 비어있으면 NotFoundException을 호출해야 함", async () => {
      const dto = { page: 1, pageSize: 10 };
      mockRestaurantRepository.getRestaurants.mockResolvedValue([]);

      jest.spyOn(ExceptionUtil, "emptyArray").mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(service.getRestaurants(dto)).rejects.toThrow(
        NotFoundException
      );
      expect(mockRestaurantRepository.getRestaurants).toHaveBeenCalledWith(dto);
      expect(ExceptionUtil.emptyArray).toHaveBeenCalledWith([]);
    });
  });

  describe("requestRestaurant", () => {
    it("매장 생성 요청 성공 시 생성된 매장 정보를 반환해야 함", async () => {
      const userId = "user-id";
      const dto = {
        name: "테스트 매장",
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

      mockRestaurantRepository.requestRestaurant.mockResolvedValue(
        mockRestaurant
      );
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      const result = await service.requestRestaurant(userId, dto);

      expect(mockRestaurantRepository.requestRestaurant).toHaveBeenCalledWith(
        userId,
        dto
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(mockRestaurant);
      expect(result).toEqual(mockRestaurant);
    });

    it("매장 생성 요청 실패 시 NotFoundException을 호출해야 함", async () => {
      const userId = "user-id";
      const dto = {
        name: "테스트 매장",
        description: "테스트 설명",
        address: "테스트 주소",
        phoneNumber: "010-1234-5678",
        businessLicenseImageUrl: "test-image-url",
        businessLicenseNumber: "test-business-license-number",
      };

      mockRestaurantRepository.requestRestaurant.mockResolvedValue(null);

      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(service.requestRestaurant(userId, dto)).rejects.toThrow(
        NotFoundException
      );
      expect(mockRestaurantRepository.requestRestaurant).toHaveBeenCalledWith(
        userId,
        dto
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(null);
    });
  });

  describe("getRestaurantRequests", () => {
    it("매장 생성 요청 목록이 존재하면 요청 목록을 반환해야 함", async () => {
      const userId = "user-id";
      const mockRequests = [
        { id: 1, status: RequestStatus.PENDING },
        { id: 2, status: RequestStatus.APPROVED },
      ];

      mockRestaurantRepository.getUserRestaurantRequests.mockResolvedValue(
        mockRequests
      );
      jest.spyOn(ExceptionUtil, "emptyArray").mockImplementation(() => {});

      const result = await service.getRestaurantRequests(userId);

      expect(
        mockRestaurantRepository.getUserRestaurantRequests
      ).toHaveBeenCalledWith(userId);
      expect(ExceptionUtil.emptyArray).toHaveBeenCalledWith(mockRequests);
      expect(result).toEqual(mockRequests);
    });

    it("매장 생성 요청 목록이 비어있으면 NotFoundException을 호출해야 함", async () => {
      const userId = "user-id";
      mockRestaurantRepository.getUserRestaurantRequests.mockResolvedValue([]);

      jest.spyOn(ExceptionUtil, "emptyArray").mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(service.getRestaurantRequests(userId)).rejects.toThrow(
        NotFoundException
      );
      expect(
        mockRestaurantRepository.getUserRestaurantRequests
      ).toHaveBeenCalledWith(userId);
      expect(ExceptionUtil.emptyArray).toHaveBeenCalledWith([]);
    });
  });

  describe("getMyRestaurants", () => {
    it("내 매장 목록이 존재하면 내 매장 목록을 반환해야 함", async () => {
      const userId = "user-id";
      const mockRestaurants = [
        { id: "test-id-1", name: "테스트 매장 1" },
        { id: "test-id-2", name: "테스트 매장 2" },
      ];

      mockRestaurantRepository.getMyRestaurants.mockResolvedValue(
        mockRestaurants
      );
      jest.spyOn(ExceptionUtil, "emptyArray").mockImplementation(() => {});

      const result = await service.getMyRestaurants(userId);

      expect(mockRestaurantRepository.getMyRestaurants).toHaveBeenCalledWith(
        userId
      );
      expect(ExceptionUtil.emptyArray).toHaveBeenCalledWith(mockRestaurants);
      expect(result).toEqual(mockRestaurants);
    });

    it("내 매장 목록이 비어있으면 NotFoundException을 호출해야 함", async () => {
      const userId = "user-id";
      mockRestaurantRepository.getMyRestaurants.mockResolvedValue([]);

      jest.spyOn(ExceptionUtil, "emptyArray").mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(service.getMyRestaurants(userId)).rejects.toThrow(
        NotFoundException
      );
      expect(mockRestaurantRepository.getMyRestaurants).toHaveBeenCalledWith(
        userId
      );
      expect(ExceptionUtil.emptyArray).toHaveBeenCalledWith([]);
    });
  });

  describe("updateMyRestaurant", () => {
    it("매장 정보 업데이트에 성공하면 업데이트된 매장 정보를 반환해야 함", async () => {
      const restaurantId = "test-id";
      const dto = {
        name: "수정된 매장명",
        description: "수정된 설명",
      };
      const mockRestaurant = {
        id: restaurantId,
        name: "기존 매장명",
        description: "기존 설명",
      };
      const mockUpdatedRestaurant = {
        id: restaurantId,
        name: dto.name,
        description: dto.description,
      };

      mockRestaurantRepository.getMyRestaurant.mockResolvedValue(
        mockRestaurant
      );
      mockRestaurantRepository.updateMyRestaurant.mockResolvedValue(
        mockUpdatedRestaurant
      );
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      const result = await service.updateMyRestaurant(restaurantId, dto);

      expect(mockRestaurantRepository.getMyRestaurant).toHaveBeenCalledWith(
        restaurantId
      );
      expect(mockRestaurantRepository.updateMyRestaurant).toHaveBeenCalledWith(
        restaurantId,
        dto
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(mockRestaurant);
      expect(ExceptionUtil.default).toHaveBeenCalledWith(mockUpdatedRestaurant);
      expect(result).toEqual(mockUpdatedRestaurant);
    });

    it("매장이 존재하지 않으면 NotFoundException을 호출해야 함", async () => {
      const restaurantId = "nonexistent-id";
      const dto = {
        name: "수정된 매장명",
      };

      mockRestaurantRepository.getMyRestaurant.mockResolvedValue(null);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(
        service.updateMyRestaurant(restaurantId, dto as UpdateRestaurantDto)
      ).rejects.toThrow(NotFoundException);
      expect(mockRestaurantRepository.getMyRestaurant).toHaveBeenCalledWith(
        restaurantId
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(null);
    });
  });

  describe("getAllRestaurantRequests", () => {
    it("모든 매장 요청 목록이 존재하면 요청 목록을 반환해야 함", async () => {
      const dto = { page: 1, pageSize: 10 };
      const mockRequests = [
        { id: 1, name: "테스트 매장 1", status: RequestStatus.PENDING },
        { id: 2, name: "테스트 매장 2", status: RequestStatus.APPROVED },
      ];

      mockRestaurantRepository.getAllRestaurantRequests.mockResolvedValue(
        mockRequests
      );
      jest.spyOn(ExceptionUtil, "emptyArray").mockImplementation(() => {});

      const result = await service.getAllRestaurantRequests(dto);

      expect(
        mockRestaurantRepository.getAllRestaurantRequests
      ).toHaveBeenCalledWith(dto);
      expect(ExceptionUtil.emptyArray).toHaveBeenCalledWith(mockRequests);
      expect(result).toEqual(mockRequests);
    });

    it("매장 요청 목록이 비어있으면 NotFoundException을 호출해야 함", async () => {
      const dto = { page: 1, pageSize: 10 };
      mockRestaurantRepository.getAllRestaurantRequests.mockResolvedValue([]);

      jest.spyOn(ExceptionUtil, "emptyArray").mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(service.getAllRestaurantRequests(dto)).rejects.toThrow(
        NotFoundException
      );
      expect(
        mockRestaurantRepository.getAllRestaurantRequests
      ).toHaveBeenCalledWith(dto);
      expect(ExceptionUtil.emptyArray).toHaveBeenCalledWith([]);
    });
  });

  describe("processRestaurantRequest", () => {
    it("매장 생성 요청 처리 성공 시 처리 결과를 반환하고 승인 메일을 전송해야 함", async () => {
      const requestId = 1;
      const dto = {
        status: RequestStatus.APPROVED,
        rejectReason: undefined,
      };
      const mockResult = {
        id: requestId,
        status: RequestStatus.APPROVED,
        rejectReason: undefined,
        user: {
          email: "test@example.com",
        },
      };

      mockRestaurantRepository.processRestaurantRequest.mockResolvedValue(
        mockResult
      );
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      const result = await service.processRestaurantRequest(requestId, dto);

      expect(
        mockRestaurantRepository.processRestaurantRequest
      ).toHaveBeenCalledWith(requestId, dto);
      expect(ExceptionUtil.default).toHaveBeenCalledWith(mockResult);

      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        mockResult.user.email,
        MailType.RESTAURANT_APPROVED
      );

      expect(result).toEqual(mockResult);
    });

    // it("매장 생성 요청이 거절된 경우 거절 메일을 전송해야 함", async () => {
    //   const requestId = 1;
    //   const dto = {
    //     status: RequestStatus.REJECTED,
    //     rejectReason: "서류 미비",
    //   };
    //   const mockResult = {
    //     id: requestId,
    //     status: RequestStatus.REJECTED,
    //     rejectReason: dto.rejectReason,
    //     user: {
    //       email: "test@example.com",
    //     },
    //   };

    //   mockRestaurantRepository.processRestaurantRequest.mockResolvedValue(
    //     mockResult
    //   );
    //   jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

    //   const result = await service.processRestaurantRequest(requestId, dto);

    // expect(mockMailService.sendMail).toHaveBeenCalledWith(
    //   mockResult.user.email,
    //   MailType.RESTAURANT_REJECTED
    // );

    //   expect(result).toEqual(mockResult);
    // });

    it("매장 생성 요청 처리 실패 시 NotFoundException을 호출해야 함", async () => {
      const requestId = 1;
      const dto = {
        status: RequestStatus.APPROVED,
        rejectReason: undefined,
      };

      mockRestaurantRepository.processRestaurantRequest.mockResolvedValue(null);

      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new NotFoundException();
      });

      await expect(
        service.processRestaurantRequest(requestId, dto)
      ).rejects.toThrow(NotFoundException);
      expect(
        mockRestaurantRepository.processRestaurantRequest
      ).toHaveBeenCalledWith(requestId, dto);
      expect(ExceptionUtil.default).toHaveBeenCalledWith(null);
    });
  });
});
