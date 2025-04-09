import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../user.service";
import { UserRepository } from "../user.repository";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { CheckUserValue, AUTH_PROVIDER_ID_MAP } from "@shared/types/enum.type";

describe("UserService", () => {
  let service: UserService;
  let userRepository: UserRepository;

  const mockUserRepository = {
    checkUserByValue: jest.fn(),
    checkUserNickname: jest.fn(),
    getUserByEmail: jest.fn(),
    create: jest.fn(),
    getUserProfileById: jest.fn(),
    updateUserProfile: jest.fn(),
    blockUser: jest.fn(),
    getChatParticipants: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("checkUser", () => {
    it("유저가 존재하면 유저 정보를 반환해야 함", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      mockUserRepository.checkUserByValue.mockResolvedValue(mockUser);

      const result = await service.checkUser(CheckUserValue.ID, "1");

      expect(userRepository.checkUserByValue).toHaveBeenCalledWith(
        CheckUserValue.ID,
        "1"
      );
      expect(result).toEqual(mockUser);
    });

    it("유저가 존재하지 않으면 ForbiddenException을 던져야 함", async () => {
      mockUserRepository.checkUserByValue.mockResolvedValue(null);

      await expect(service.checkUser(CheckUserValue.ID, "1")).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe("checkNickname", () => {
    it("닉네임이 중복되지 않으면 false를 반환해야 함", async () => {
      mockUserRepository.checkUserNickname.mockResolvedValue(false);

      const result = await service.checkNickname({ nickname: "testuser" });

      expect(userRepository.checkUserNickname).toHaveBeenCalledWith("testuser");
      expect(result).toEqual(false);
    });

    it("닉네임이 중복되면 ConflictException을 던져야 함", async () => {
      mockUserRepository.checkUserNickname.mockResolvedValue(true);

      await expect(
        service.checkNickname({ nickname: "testuser" })
      ).rejects.toThrow(ConflictException);
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
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto as any);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        createUserDto.email
      );
      expect(userRepository.checkUserNickname).toHaveBeenCalledWith(
        createUserDto.nickname
      );
      expect(userRepository.create).toHaveBeenCalledWith(
        createUserDto,
        AUTH_PROVIDER_ID_MAP.kakao
      );
      expect(result).toEqual(mockUser);
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

      await expect(service.createUser(createUserDto as any)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("getUserByEmail", () => {
    it("이메일로 유저 정보를 반환해야 함", async () => {
      const mockUser = { id: "1", email: "test@example.com" };
      mockUserRepository.getUserByEmail.mockResolvedValue(mockUser);

      const result = await service.getUserByEmail("test@example.com");

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(result).toEqual(mockUser);
    });

    it("유저가 존재하지 않으면 NotFoundException을 던져야 함", async () => {
      mockUserRepository.getUserByEmail.mockResolvedValue(null);

      await expect(service.getUserByEmail("test@example.com")).rejects.toThrow(
        NotFoundException
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

      const result = await service.getUserProfileById(userId);

      expect(userRepository.checkUserByValue).toHaveBeenCalledWith(
        CheckUserValue.ID,
        userId
      );
      expect(userRepository.getUserProfileById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockProfile);
    });

    it("프로필이 존재하지 않으면 NotFoundException을 던져야 함", async () => {
      const userId = "1";
      const mockUser = { id: userId };

      mockUserRepository.checkUserByValue.mockResolvedValue(mockUser);
      mockUserRepository.getUserProfileById.mockResolvedValue(null);

      await expect(service.getUserProfileById(userId)).rejects.toThrow(
        NotFoundException
      );
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
    });

    it("프로필이 존재하지 않으면 NotFoundException을 던져야 함", async () => {
      const userId = "1";
      const updateDto = { nickname: "updateduser" };
      const mockUser = { id: userId };

      mockUserRepository.checkUserByValue.mockResolvedValue(mockUser);
      mockUserRepository.updateUserProfile.mockResolvedValue(null);

      await expect(
        service.updateUserProfile(userId, updateDto as any)
      ).rejects.toThrow(NotFoundException);
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
