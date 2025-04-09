import { UserController } from "../user.controller";
import { IUserService } from "@shared/interfaces/user.interface";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UpdateUserProfileDto } from "../dtos/update-user.dto";
import { CheckNicknameDto, GetChatParticipantsDto } from "../dtos/get-user.dto";
import { AuthRequest } from "@shared/types/request.type";
import { AuthProvider } from "@/shared/types/enum.type";
import { mockUserService } from "./user.mock";
import { mockUserModule } from "./user.mock";

describe("UserController", () => {
  let controller: UserController;
  let userService: IUserService;

  beforeEach(async () => {
    const module = await mockUserModule();

    controller = module.get<UserController>(UserController);
    userService = module.get<IUserService>("IUserService");
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("signup", () => {
    it("회원가입 성공 시 생성된 유저 정보를 반환해야 함", async () => {
      const dto = {
        email: "test@example.com",
        authType: AuthProvider.KAKAO,
        nickname: "testuser",
        name: "테스트",
        phoneNumber: "01012345678",
        isEventAgree: true,
      } as CreateUserDto;

      const mockUser = { id: "1", email: dto.email, nickname: dto.nickname };

      mockUserService.createUser.mockResolvedValue(mockUser);

      const result = await controller.signup(dto);

      expect(userService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe("checkNickname", () => {
    it("닉네임 중복 확인 결과를 반환해야 함", async () => {
      const dto: CheckNicknameDto = { nickname: "testuser" };

      mockUserService.checkNickname.mockResolvedValue(false);

      const result = await controller.checkNickname(dto);

      expect(userService.checkNickname).toHaveBeenCalledWith(dto);
      expect(result).toEqual(false);
    });
  });

  describe("getUserProfile", () => {
    it("유저 프로필 정보를 반환해야 함", async () => {
      const req = { user: { userId: "1" } } as AuthRequest;
      const mockProfile = {
        id: "1",
        nickname: "testuser",
        email: "test@example.com",
        profile: {
          id: "1",
          userId: "1",
          nickname: "testuser",
        },
      };

      mockUserService.getUserProfileById.mockResolvedValue(mockProfile);

      const result = await controller.getUserProfile(req);

      expect(userService.getUserProfileById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockProfile);
    });
  });

  describe("updateUserProfile", () => {
    it("업데이트된 유저 프로필 정보를 반환해야 함", async () => {
      const req = { user: { userId: "1" } } as AuthRequest;
      const dto = {
        nickname: "updateduser",
        image: "profile-image.jpg",
      } as UpdateUserProfileDto;

      const mockProfile = {
        id: "1",
        nickname: "updateduser",
        email: "test@example.com",
        profile: {
          id: "1",
          userId: "1",
          nickname: "updateduser",
          image: "profile-image.jpg",
        },
      };

      mockUserService.updateUserProfile.mockResolvedValue(mockProfile);

      const result = await controller.updateUserProfile(dto, req);

      expect(userService.updateUserProfile).toHaveBeenCalledWith("1", dto);
      expect(result).toEqual(mockProfile);
    });
  });

  describe("getChatParticipants", () => {
    it("채팅 참여자 정보를 반환해야 함", async () => {
      const dto: GetChatParticipantsDto = { userIds: ["1", "2"] };
      const mockParticipants = [
        { id: "1", nickname: "user1", profile: { profileImage: "image1.jpg" } },
        { id: "2", nickname: "user2", profile: { profileImage: "image2.jpg" } },
      ];

      mockUserService.getChatParticipants.mockResolvedValue(mockParticipants);

      const result = await controller.getChatParticipants(dto);

      expect(userService.getChatParticipants).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockParticipants);
    });
  });
});
