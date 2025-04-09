import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { Test } from "@nestjs/testing";

export async function mockAuthModule() {
  return await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      {
        provide: AuthService,
        useValue: mockAuthService,
      },
    ],
  }).compile();
}

export const mockAuthService = {
  authenticate: jest.fn(),
  logout: jest.fn(),
  verify: jest.fn(),
  getBlacklist: jest.fn(),
  createTokens: jest.fn(),
  setBlacklist: jest.fn(),
};

export const mockAuthGuard = {
  canActivate: jest.fn().mockImplementation(() => true),
};
