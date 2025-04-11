import { TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { LoginDto } from "../dtos/create-auth.dto";
import {
  AUTH_PROVIDER_ID_MAP,
  AuthProvider,
  BlackListEnum,
  TokenEnum,
} from "@shared/types/enum.type";
import { TokenErrorMessage } from "@/shared/types/message.type";
import { Role } from "@prisma/client";
import { mockAuthServiceModule } from "./auth.mock";
import { mockUserService } from "@/modules/user/tests/user.mock";
import { mockRedis } from "@/core/redis/tests/redis.mock";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await mockAuthServiceModule();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("authenticate", () => {
    it("유저가 존재하지 않으면 NotFoundException을 던져야 함", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password",
        // authType: AuthProvider.KAKAO,
      };
      mockUserService.getUserByEmail.mockResolvedValue(null);

      await expect(
        service.authenticate(loginDto, "127.0.0.1", "test-agent")
      ).rejects.toThrow(NotFoundException);
    });

    it("인증방법이 호환되지 않으면 ForbiddenException을 던져야 함", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password",
        // authType: AuthProvider.KAKAO,
      };
      const user = { id: "1", authProviderId: AUTH_PROVIDER_ID_MAP.google };
      mockUserService.getUserByEmail.mockResolvedValue(user);

      await expect(
        service.authenticate(loginDto, "127.0.0.1", "test-agent")
      ).rejects.toThrow(ForbiddenException);
    });

    it("인증 성공 시 토큰과 유저 정보를 반환해야 함", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password",
        // authType: AuthProvider.KAKAO,
      };
      const user = {
        id: "1",
        authProviderId: AUTH_PROVIDER_ID_MAP.kakao,
        role: Role.CUSTOMER,
      };
      mockUserService.getUserByEmail.mockResolvedValue(user);

      jest
        .spyOn(service, "createTokens")
        .mockResolvedValue({ accessToken: "access", refreshToken: "refresh" });
      jest
        .spyOn(service, "resetFailedLoginAttempts")
        .mockResolvedValue(undefined);

      const result = await service.authenticate(
        loginDto,
        "127.0.0.1",
        "test-agent"
      );

      expect(result).toEqual({
        user,
        accessToken: "access",
        refreshToken: "refresh",
      });
      expect(service.resetFailedLoginAttempts).toHaveBeenCalledWith("1");
    });
  });

  describe("createTokens", () => {
    it("유효한 토큰을 생성해야 함", async () => {
      const mockToken = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };

      jest.spyOn(service, "createTokens").mockResolvedValue(mockToken);

      const result = await service.createTokens(
        "1",
        "127.0.0.1",
        "test-agent",
        "user"
      );

      expect(result).toEqual(mockToken);
    });
  });

  describe("verify", () => {
    it("ACCESS 토큰 검증 성공 시 페이로드를 반환해야 함", async () => {
      const payload = {
        userId: "1",
        role: "user",
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      jest.spyOn(service, "verify").mockResolvedValue(payload);
      const result = await service.verify("token", "secret", TokenEnum.ACCESS);

      expect(result).toEqual({ userId: "1", role: "user", exp: payload.exp });
    });

    it("토큰이 만료되면 UnauthorizedException을 던져야 함", async () => {
      jest
        .spyOn(service, "verify")
        .mockRejectedValue(
          new UnauthorizedException(TokenErrorMessage.TOKEN_EXPIRED)
        );

      await expect(
        service.verify("token", "secret", TokenEnum.ACCESS)
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("getBlacklist", () => {
    it("블랙리스트에 있는 토큰은 BLACKLISTED 상태를 반환해야 함", async () => {
      mockRedis.hgetall.mockResolvedValue({ accessToken: "blacklisted-token" });

      const result = await service.getBlacklist("1", "blacklisted-token");

      expect(result).toEqual({ message: BlackListEnum.BLACKLISTED });
    });

    it("블랙리스트에 없는 토큰은 NON_BLACKLISTED 상태를 반환해야 함", async () => {
      mockRedis.hgetall.mockResolvedValue({ accessToken: "other-token" });

      const result = await service.getBlacklist("1", "token");

      expect(result).toEqual({ message: BlackListEnum.NON_BLACKLISTED });
    });
  });
});
