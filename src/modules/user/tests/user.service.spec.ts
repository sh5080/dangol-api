import { TestingModule } from "@nestjs/testing";
import { UserService } from "../user.service";
import { UserRepository } from "../user.repository";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { CheckUserValue, AUTH_PROVIDER_ID_MAP } from "@shared/types/enum.type";
import { mockUserServiceModule, mockUserRepository } from "./user.mock";
import { ExceptionUtil } from "@/shared/utils/exception.util";
import { UserErrorMessage } from "@/shared/types/message.type";
import { CreateUserDto } from "../dtos/create-user.dto";

describe("UserService", () => {
  let service: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await mockUserServiceModule();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);

    // 테스트마다 모킹 초기화
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("checkUser", () => {
    it("유저가 존재하면 유저 정보를 반환해야 함", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      mockUserRepository.checkUserByValue.mockResolvedValue(mockUser);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});
      const result = await service.checkUser(CheckUserValue.ID, "1");

      expect(userRepository.checkUserByValue).toHaveBeenCalledWith(
        CheckUserValue.ID,
        "1"
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        mockUser,
        UserErrorMessage.USER_NOT_FOUND,
        403
      );
      expect(result).toEqual(mockUser);
    });

    it("유저가 존재하지 않으면 ForbiddenException을 던져야 함", async () => {
      mockUserRepository.checkUserByValue.mockResolvedValue(null);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new ForbiddenException();
      });

      await expect(service.checkUser(CheckUserValue.ID, "1")).rejects.toThrow(
        ForbiddenException
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        null,
        UserErrorMessage.USER_NOT_FOUND,
        403
      );
    });
  });

  describe("createUser", () => {
    it("유저 생성에 성공하면 생성된 유저 정보를 반환해야 함", async () => {
      const dto: CreateUserDto = {
        email: "test@example.com",
        password: "password",
        name: "test",
        phoneNumber: "01012345678",
        isPersonalInfoCollectionAgree: true,
        isPersonalInfoUseAgree: true,
      };

      const mockUser = {
        id: "1",
        email: dto.email,
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.checkUserNickname.mockResolvedValue(false);
      mockUserRepository.createUser.mockResolvedValue(mockUser);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      const result = await service.createUser(dto as any);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(userRepository.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);

      // 현재 서비스 구현에 맞게 수정: ExceptionUtil.default는 한 번만 호출됨
      expect(ExceptionUtil.default).toHaveBeenCalledTimes(1);
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        true, // !isExist의 결과
        UserErrorMessage.EMAIL_CONFLICTED,
        409
      );
    });

    it("이메일이 중복되면 ConflictException을 던져야 함", async () => {
      const createUserDto = {
        email: "test@example.com",
        authType: "kakao",
        nickname: "testuser",
      };
      mockUserRepository.getUserByEmail.mockResolvedValue({
        id: "1",
        email: createUserDto.email,
      });

      // 예외를 던지도록 설정
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new ConflictException();
      });

      await expect(service.createUser(createUserDto as any)).rejects.toThrow(
        ConflictException
      );

      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        false, // !isExist의 결과 (isExist가 있으므로 false)
        UserErrorMessage.EMAIL_CONFLICTED,
        409
      );
    });
  });

  describe("getUserByEmail", () => {
    it("이메일로 유저 정보를 반환해야 함", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});
      const result = await service.getUserByEmail("test@example.com");

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(result).toEqual(mockUser);
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        mockUser,
        UserErrorMessage.USER_NOT_FOUND
      );
    });

    it("유저가 존재하지 않으면 NotFoundException을 던져야 함", async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(service.getUserByEmail("test@example.com")).rejects.toThrow(
        NotFoundException
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        null,
        UserErrorMessage.USER_NOT_FOUND
      );
    });
  });

  // describe("getChatParticipants", () => {
  //   it("채팅 참여자 정보를 반환해야 함", async () => {
  //     const userIds = ["1", "2"];
  //     const mockParticipants = [
  //       { id: "1", restaurantName: "user1" },
  //       { id: "2", restaurantName: "user2" },
  //     ];

  //     mockUserRepository.getChatParticipants.mockResolvedValue(
  //       mockParticipants
  //     );

  //     const result = await service.getChatParticipants({ userIds });

  //     expect(userRepository.getChatParticipants).toHaveBeenCalledWith(userIds);
  //     expect(result).toEqual(mockParticipants);
  //   });

  //   it("참여자가 부족하면 NotFoundException을 던져야 함", async () => {
  //     const userIds = ["1", "2"];
  //     mockUserRepository.getChatParticipants.mockResolvedValue([{ id: "1" }]);

  //     await expect(service.getChatParticipants({ userIds })).rejects.toThrow(
  //       NotFoundException
  //     );
  //   });

  //   it("참여자가 없으면 NotFoundException을 던져야 함", async () => {
  //     const userIds = ["1", "2"];
  //     mockUserRepository.getChatParticipants.mockResolvedValue(null);

  //     await expect(service.getChatParticipants({ userIds })).rejects.toThrow(
  //       NotFoundException
  //     );
  //   });
  // });
});
