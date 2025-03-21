import { TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { mock } from "jest-mock-extended";
import { IUserService } from "../interfaces/user.interface";
import { CreateUserDto } from "./dtos/create-user.dto";
import { AuthProvider } from "../types/enum.type";
import { AuthService } from "../auth/auth.service";
import { createTestingModule } from "../test/test.util";
import { MailService } from "../mail/mail.service";
import { EncryptionService } from "../utils/encryption.util";
import { UserRepository } from "./user.repository";

describe("UserController", () => {
  let controller: UserController;
  let userService: IUserService;

  beforeEach(async () => {
    userService = mock<IUserService>();

    const module: TestingModule = await createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: "IUserService",
          useValue: userService,
        },
        AuthService,
        EncryptionService,
        MailService,
        UserRepository,
      ],
    });

    controller = module.get<UserController>(UserController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createUser", () => {
    it("should call userService.createUser with dto", async () => {
      const dto: CreateUserDto = {
        email: "test@example.com",
        password: "Password123!",
        name: "testuser",
        affiliation: "test",
        phoneNumber: "01012345678",
        class: "test",
        isEventAgree: true,
        authType: AuthProvider.NUCODE,
        nickname: "testuser",
      };

      const mockResult = {
        id: "123",
        email: dto.email,
        nickname: dto.nickname,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userService.createUser as jest.Mock).mockResolvedValue(mockResult);

      // When
      const result = await controller.signup(dto);

      // Then
      expect(result).toEqual(mockResult);
      expect(userService.createUser).toHaveBeenCalledWith(dto);
    });
  });
});
