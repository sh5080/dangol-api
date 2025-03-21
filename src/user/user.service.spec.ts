import { ForbiddenException } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { mockUser } from "../test/mocks/user.mock";
import { CheckUserValue } from "../types/enum.type";
import { AuthProvider } from "../types/enum.type";
import { UserRepository } from "./user.repository";
import { MailService } from "../mail/mail.service";
import {
  createTestingModule,
  mockPrismaClient,
  resetMocks,
} from "../test/test.util";

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    resetMocks();

    const module: TestingModule = await createTestingModule({
      providers: [UserService, UserRepository, MailService],
    });

    service = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createUser", () => {
    it("누코드 로그인 인증코드 미입력", async () => {
      // mockPrismaClient.user.create = jest.fn().mockResolvedValueOnce(mockUser);

      const dto = {
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

      await expect(service.createUser(dto)).rejects.toThrow(ForbiddenException);
      await expect(service.createUser(dto)).rejects.toThrow(
        "누코드 로그인은 이메일 인증이 선행되어야 합니다."
      );
      expect(mockPrismaClient.user.create).not.toHaveBeenCalled();
    });
  });

  describe("checkUser", () => {
    it("이메일 중복 검사", async () => {
      mockPrismaClient.user.findUnique = jest.fn().mockResolvedValueOnce({
        id: "123",
        email: "test@example.com",
      });

      const result = await service.checkUser(
        CheckUserValue.EMAIL,
        "test1@example.com"
      );

      expect(result).toBe(true);
    });
  });
});
