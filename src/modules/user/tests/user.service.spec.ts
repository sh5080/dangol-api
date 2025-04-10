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
      expect(result).toEqual(mockUser);
      expect(ExceptionUtil.default).toHaveBeenCalled();
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

  describe("checkNickname", () => {
    it("닉네임이 중복되지 않으면 false를 반환해야 함", async () => {
      mockUserRepository.checkUserNickname.mockResolvedValue(false);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});
      const result = await service.checkNickname({ nickname: "testuser" });

      expect(userRepository.checkUserNickname).toHaveBeenCalledWith("testuser");
      expect(result).toEqual(false);
      expect(ExceptionUtil.default).toHaveBeenCalled();
    });

    it("닉네임이 중복되면 ConflictException을 던져야 함", async () => {
      mockUserRepository.checkUserNickname.mockResolvedValue(true);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new ConflictException();
      });
      await expect(
        service.checkNickname({ nickname: "testuser" })
      ).rejects.toThrow(ConflictException);
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        false,
        UserErrorMessage.NICKNAME_CONFLICTED,
        409
      );
    });
  });

  describe("createUser", () => {
    it("유저 생성에 성공하면 생성된 유저 정보를 반환해야 함", async () => {
      const createUserDto = {
        email: "test@example.com",
        authType: "kakao",
        nickname: "testuser",
      };
      const mockUser = {
        id: "1",
        email: createUserDto.email,
        nickname: createUserDto.nickname,
      };

      mockUserRepository.getUserByEmail.mockResolvedValue(null);
      mockUserRepository.checkUserNickname.mockResolvedValue(false);
      mockUserRepository.createUser.mockResolvedValue(mockUser);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      const result = await service.createUser(createUserDto as any);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        createUserDto.email
      );
      expect(userRepository.checkUserNickname).toHaveBeenCalledWith(
        createUserDto.nickname
      );
      expect(userRepository.createUser).toHaveBeenCalledWith(
        createUserDto,
        AUTH_PROVIDER_ID_MAP.kakao
      );

      expect(result).toEqual(mockUser);
      expect(ExceptionUtil.default).toHaveBeenCalled();
      expect(ExceptionUtil.default).toHaveBeenCalled();
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
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new ConflictException();
      });
      await expect(service.createUser(createUserDto as any)).rejects.toThrow(
        ConflictException
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        false,
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
      expect(ExceptionUtil.default).toHaveBeenCalled();
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

  describe("getUserProfileById", () => {
    it("유저 프로필 정보를 반환해야 함", async () => {
      const userId = "1";
      const mockUser = { id: userId };
      const mockProfile = {
        id: userId,
        nickname: "testuser",
        email: "test@example.com",
        profile: {
          id: "1",
          userId: userId,
          nickname: "testuser",
        },
      };

      mockUserRepository.checkUserByValue.mockResolvedValue(mockUser);
      mockUserRepository.getUserProfileById.mockResolvedValue(mockProfile);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});
      const result = await service.getUserProfileById(userId);

      expect(userRepository.checkUserByValue).toHaveBeenCalledWith(
        CheckUserValue.ID,
        userId
      );
      expect(userRepository.getUserProfileById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockProfile);
      expect(ExceptionUtil.default).toHaveBeenCalled();
    });

    it("유저가 존재하지 않으면 ForbiddenException을 던져야 함", async () => {
      const userId = "1";
      const mockUser = { id: userId };

      mockUserRepository.checkUserByValue.mockResolvedValue(mockUser);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new ForbiddenException();
      });
      mockUserRepository.getUserProfileById.mockResolvedValue(null);

      await expect(service.getUserProfileById(userId)).rejects.toThrow(
        ForbiddenException
      );
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        mockUser,
        UserErrorMessage.USER_NOT_FOUND,
        403
      );
    });
    it("프로필이 존재하지 않으면 NotFoundException을 던져야 함", async () => {
      const userId = "1";
      const mockUser = { id: userId };

      mockUserRepository.checkUserByValue.mockResolvedValue(mockUser);
      mockUserRepository.getUserProfileById.mockResolvedValue(null);

      // 모킹 함수가 호출 순서에 따라 다르게 동작하도록 설정
      jest
        .spyOn(ExceptionUtil, "default")
        .mockImplementationOnce(() => {}) // 첫 번째 호출: 사용자 존재 검증 (오류 없음)
        .mockImplementationOnce(() => {
          // 두 번째 호출: 프로필 존재 검증 (404 오류)
          throw new NotFoundException();
        });

      await expect(service.getUserProfileById(userId)).rejects.toThrow(
        NotFoundException
      );
      expect(ExceptionUtil.default).toHaveBeenCalledTimes(2);
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(
        1,
        mockUser,
        UserErrorMessage.USER_NOT_FOUND,
        403
      );
      expect(ExceptionUtil.default).toHaveBeenNthCalledWith(2, null);
    });
  });

  describe("updateUserProfile", () => {
    it("업데이트된 유저 프로필 정보를 반환해야 함", async () => {
      const userId = "1";
      const updateDto = { nickname: "updateduser" };
      const mockUser = { id: userId };
      const mockUpdatedProfile = {
        id: userId,
        nickname: "updateduser",
        email: "test@example.com",
        profile: {
          id: "1",
          userId: userId,
          nickname: "updateduser",
        },
      };

      mockUserRepository.checkUserByValue.mockResolvedValue(mockUser);
      mockUserRepository.updateUserProfile.mockResolvedValue(
        mockUpdatedProfile
      );
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});
      const result = await service.updateUserProfile(userId, updateDto as any);

      expect(userRepository.checkUserByValue).toHaveBeenCalledWith(
        CheckUserValue.ID,
        userId
      );
      expect(userRepository.updateUserProfile).toHaveBeenCalledWith(
        userId,
        updateDto
      );
      expect(result).toEqual(mockUpdatedProfile);
      expect(ExceptionUtil.default).toHaveBeenCalled();
    });

    it("프로필이 존재하지 않으면 NotFoundException을 던져야 함", async () => {
      const userId = "1";
      const updateDto = { nickname: "updateduser" };
      const mockUser = { id: userId };

      mockUserRepository.checkUserByValue.mockResolvedValue(mockUser);
      mockUserRepository.updateUserProfile.mockResolvedValue(null);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(
        service.updateUserProfile(userId, updateDto as any)
      ).rejects.toThrow(NotFoundException);
      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        mockUser,
        UserErrorMessage.USER_NOT_FOUND,
        403
      );
    });
  });

  describe("getChatParticipants", () => {
    it("채팅 참여자 정보를 반환해야 함", async () => {
      const userIds = ["1", "2"];
      const mockParticipants = [
        { id: "1", nickname: "user1", profile: { profileImage: "image1.jpg" } },
        { id: "2", nickname: "user2", profile: { profileImage: "image2.jpg" } },
      ];

      mockUserRepository.getChatParticipants.mockResolvedValue(
        mockParticipants
      );

      const result = await service.getChatParticipants({ userIds });

      expect(userRepository.getChatParticipants).toHaveBeenCalledWith(userIds);
      expect(result).toEqual(mockParticipants);
    });

    it("참여자가 부족하면 NotFoundException을 던져야 함", async () => {
      const userIds = ["1", "2"];
      mockUserRepository.getChatParticipants.mockResolvedValue([{ id: "1" }]);

      await expect(service.getChatParticipants({ userIds })).rejects.toThrow(
        NotFoundException
      );
    });

    it("참여자가 없으면 NotFoundException을 던져야 함", async () => {
      const userIds = ["1", "2"];
      mockUserRepository.getChatParticipants.mockResolvedValue(null);

      await expect(service.getChatParticipants({ userIds })).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
