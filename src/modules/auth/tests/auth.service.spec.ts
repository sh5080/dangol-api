import {
  ExceptionUtil,
  AuthErrorMessage,
  TokenErrorMessage,
  Role,
  BlackListEnum,
  TokenEnum,
} from "@dangol/core";
import { AuthService } from "@dangol/cache";

import { TestingModule } from "@nestjs/testing";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "../dtos/create-auth.dto";
import { mockAuthServiceModule } from "./auth.mock";
import { mockUserService } from "@/modules/user/tests/user.mock";
import { mockRedis } from "@/core/redis/tests/redis.mock";

import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

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
    it("비활성화된 계정으로 로그인 시도하면 ForbiddenException을 던져야 함", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password",
      };
      const user = {
        id: "1",
        email: "test@example.com",
        isActive: false,
      };

      mockUserService.getUserByEmail.mockResolvedValue(user);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {
        throw new ForbiddenException(AuthErrorMessage.ACCOUNT_BLOCKED);
      });

      await expect(
        service.authenticate(loginDto, "127.0.0.1", "test-agent")
      ).rejects.toThrow(ForbiddenException);

      expect(ExceptionUtil.default).toHaveBeenCalledWith(
        false,
        AuthErrorMessage.ACCOUNT_BLOCKED,
        403
      );
    });

    it("비밀번호가 일치하지 않으면 로그인 시도 횟수가 증가해야 함", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "wrong-password",
      };
      const user = {
        id: "1",
        email: "test@example.com",
        password: "hashed-password",
        isActive: true,
      };

      mockUserService.getUserByEmail.mockResolvedValue(user);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      jest
        .spyOn(service, "incrementFailedLoginAttempts")
        .mockImplementation(() => {
          throw new UnauthorizedException(AuthErrorMessage.PASSWORD_MISMATCH);
        });

      await expect(
        service.authenticate(loginDto, "127.0.0.1", "test-agent")
      ).rejects.toThrow(UnauthorizedException);

      expect(service.incrementFailedLoginAttempts).toHaveBeenCalledWith("1");
    });

    it("인증 성공 시 토큰과 유저 정보를 반환해야 함", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "correct-password",
      };
      const user = {
        id: "1",
        email: "test@example.com",
        password: "hashed-password",
        isActive: true,
        role: Role.CUSTOMER,
      };

      mockUserService.getUserByEmail.mockResolvedValue(user);
      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

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

  describe("incrementFailedLoginAttempts", () => {
    it("로그인 시도 횟수가 최대 시도 횟수 미만이면 횟수를 증가시켜야 함", async () => {
      mockRedis.get.mockResolvedValue("2"); // 기존 시도 횟수
      mockRedis.incr.mockResolvedValue(3); // 증가 후 시도 횟수

      await expect(service.incrementFailedLoginAttempts("1")).rejects.toThrow(
        UnauthorizedException
      );

      expect(mockRedis.incr).toHaveBeenCalled();
    });

    it("로그인 시도 횟수가 최대에 도달하면 계정을 차단해야 함", async () => {
      mockRedis.get.mockResolvedValue("5"); // 최대 시도 횟수에 도달

      jest.spyOn(mockUserService, "blockUser").mockResolvedValue(undefined);

      await expect(service.incrementFailedLoginAttempts("1")).rejects.toThrow(
        UnauthorizedException
      );

      expect(mockUserService.blockUser).toHaveBeenCalled();
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
        role: Role.CUSTOMER,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      jest.spyOn(service, "verify").mockResolvedValue(payload);
      const result = await service.verify("token", "secret", TokenEnum.ACCESS);

      expect(result).toEqual({
        userId: "1",
        role: Role.CUSTOMER,
        exp: payload.exp,
      });
    });

    it("REFRESH 토큰 검증 시 세션이 존재하지 않으면 UnauthorizedException을 던져야 함", async () => {
      mockRedis.hgetall.mockResolvedValue({});

      jest.spyOn(ExceptionUtil, "default").mockImplementation(() => {});

      await expect(
        service.verify("token", "secret", TokenEnum.REFRESH, "1")
      ).rejects.toThrow(UnauthorizedException);
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

  describe("logout", () => {
    it("로그아웃 성공 시 세션을 삭제하고 토큰을 블랙리스트에 추가해야 함", async () => {
      mockRedis.del.mockResolvedValue(1);

      jest.spyOn(service, "setBlacklist").mockResolvedValue({
        message: BlackListEnum.BLACKLISTED,
      });

      const result = await service.logout("1", "token");

      expect(mockRedis.del).toHaveBeenCalled();
      expect(service.setBlacklist).toHaveBeenCalledWith("1", "token");
      expect(result).toBe(true);
    });
  });
});
