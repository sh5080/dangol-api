import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { LoginDto } from "../dtos/create-auth.dto";
import { Request } from "express";
import { AuthRequest } from "@shared/types/request.type";
import { AuthProvider } from "@/shared/types/enum.type";
import { mockAuthModule, mockAuthService } from "./auth.mock";

describe("AuthController", () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module = await mockAuthModule();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("로그인 성공 시 인증 결과를 반환해야 함", async () => {
      const dto: LoginDto = {
        email: "test@example.com",
        password: "test123123!",
        // authType: AuthProvider.KAKAO,
      };
      const req = {
        ip: "127.0.0.1",
        headers: { "user-agent": "test-agent" },
      } as Request;
      const mockResult = {
        user: { id: "1" },
        accessToken: "access",
        refreshToken: "refresh",
      };

      mockAuthService.authenticate.mockResolvedValue(mockResult);

      const result = await controller.login(dto, req);

      expect(service.authenticate).toHaveBeenCalledWith(
        dto,
        "127.0.0.1",
        "test-agent"
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("token", () => {
    it("토큰 검증이 성공하면 true를 반환해야 함", async () => {
      const result = await controller.token();
      expect(result).toBe(true);
    });
  });

  describe("logout", () => {
    it("로그아웃 성공 시 true를 반환해야 함", async () => {
      const req = {
        user: {
          userId: "1",
          tokens: {
            accessToken: "access-token",
          },
        },
      } as AuthRequest;

      mockAuthService.logout.mockResolvedValue(true);

      const result = await controller.logout(req);

      expect(service.logout).toHaveBeenCalledWith("1", "access-token");
      expect(result).toBe(true);
    });
  });
});
