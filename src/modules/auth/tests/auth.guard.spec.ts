import { BlackListEnum, TokenEnum } from "@dangol/core";
import { AuthGuard, AuthService } from "@dangol/cache";

import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext } from "@nestjs/common";
import { createMock } from "@golevelup/ts-jest";
import { mockAuthService } from "./auth.mock";
describe("AuthGuard", () => {
  let guard: AuthGuard;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("Authorization 헤더가 없으면 BadRequestException을 던져야 함", async () => {
      const context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
          getResponse: () => ({}),
        }),
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        "로그인이 필요합니다"
      );
    });

    it("토큰이 유효하고 블랙리스트에 없으면 true를 반환해야 함", async () => {
      const context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: "Bearer valid-token",
            },
            user: {},
          }),
          getResponse: () => ({}),
        }),
      });

      mockAuthService.verify.mockResolvedValue({ userId: "1", role: "user" });
      mockAuthService.getBlacklist.mockResolvedValue({
        message: BlackListEnum.NON_BLACKLISTED,
      });

      const result = await guard.canActivate(context);

      expect(authService.verify).toHaveBeenCalledWith(
        "valid-token",
        expect.any(String),
        TokenEnum.ACCESS
      );
      expect(authService.getBlacklist).toHaveBeenCalledWith("1", "valid-token");
      expect(result).toBeTruthy();
    });

    it("토큰이 블랙리스트에 있으면 ForbiddenException을 던져야 함", async () => {
      const context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: "Bearer blacklisted-token",
            },
          }),
          getResponse: () => ({}),
        }),
      });

      mockAuthService.verify.mockResolvedValue({ userId: "1", role: "user" });
      mockAuthService.getBlacklist.mockResolvedValue({
        message: BlackListEnum.BLACKLISTED,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        "접근 권한이 없습니다"
      );
      expect(authService.verify).toHaveBeenCalledWith(
        "blacklisted-token",
        expect.any(String),
        TokenEnum.ACCESS
      );
      expect(authService.getBlacklist).toHaveBeenCalledWith(
        "1",
        "blacklisted-token"
      );
    });
  });
});
