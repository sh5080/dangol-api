import { UserController } from "../user.controller";
import { IUserService } from "@shared/interfaces/user.interface";
import { CreateUserDto } from "../dtos/create-user.dto";
import { mockUserService } from "./user.mock";
import { mockUserModule } from "./user.mock";
import { FindEmailDto } from "../dtos/get-user.dto";
import { CertificationDto } from "../dtos/create-user.dto";
import { UpdatePasswordDto } from "../dtos/update-user.dto";
import { MailType } from "@/shared/types/enum.type";

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
        password: "password",
        name: "테스트",
        phoneNumber: "01012345678",
        isPersonalInfoCollectionAgree: true,
        isPersonalInfoUseAgree: true,
      } as CreateUserDto;

      const mockUser = { id: "1", email: dto.email, name: dto.name };

      mockUserService.createUser.mockResolvedValue(mockUser);

      const result = await controller.signup(dto);

      expect(userService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe("checkEmail", () => {
    it("이메일이 중복되지 않으면 true를 반환해야 함", async () => {
      const dto = { email: "test@example.com" };

      mockUserService.existEmail.mockResolvedValue(true);

      const result = await controller.checkEmail(dto);

      expect(userService.existEmail).toHaveBeenCalledWith(dto.email);
      expect(result).toBe(true);
    });
  });

  describe("findEmail", () => {
    it("이름과 전화번호로 이메일을 찾아서 반환해야 함", async () => {
      const dto: FindEmailDto = {
        name: "홍길동",
        phoneNumber: "01012345678",
      };

      const mockEmail = { email: "test@example.com" };
      mockUserService.findEmail.mockResolvedValue(mockEmail);

      const result = await controller.findEmail(dto);

      expect(userService.findEmail).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEmail);
    });
  });

  describe("updatePasswordCertification", () => {
    it("비밀번호 재설정 인증 메일을 성공적으로 보내야 함", async () => {
      const dto: CertificationDto = {
        type: MailType.CHANGE_PASSWORD,
        email: "test@example.com",
        name: "홍길동",
      };

      mockUserService.updatePasswordCertification.mockResolvedValue(undefined);

      await controller.updatePasswordCertification(dto);

      expect(userService.updatePasswordCertification).toHaveBeenCalledWith(dto);
    });
  });

  describe("updatePassword", () => {
    it("비밀번호를 성공적으로 업데이트해야 함", async () => {
      const dto: UpdatePasswordDto = {
        type: MailType.CHANGE_PASSWORD,
        email: "test@example.com",
        name: "홍길동",
        code: "123456",
        password: "newPassword123",
      };

      mockUserService.updatePassword.mockResolvedValue(undefined);

      await controller.updatePassword(dto);

      expect(userService.updatePassword).toHaveBeenCalledWith(dto);
    });
  });

  // describe("getChatParticipants", () => {
  //   it("채팅 참여자 정보를 반환해야 함", async () => {
  //     const dto: GetChatParticipantsDto = { userIds: ["1", "2"] };
  //     const mockParticipants = [
  //       {
  //         id: "1",
  //         restaurantName: "user1",
  //       },
  //       {
  //         id: "2",
  //         restaurantName: "user2",
  //       },
  //     ];

  //     mockUserService.getChatParticipants.mockResolvedValue(mockParticipants);

  //     const result = await controller.getChatParticipants(dto);

  //     expect(userService.getChatParticipants).toHaveBeenCalledWith(dto);
  //     expect(result).toEqual(mockParticipants);
  //   });
  // });
});
