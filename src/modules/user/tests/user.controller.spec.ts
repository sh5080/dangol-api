import { UserController } from "../user.controller";
import { IUserService } from "@shared/interfaces/user.interface";
import { CreateUserDto } from "../dtos/create-user.dto";
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
