import { UserController } from "../user.controller";
import { mockAuthService, mockAuthGuard } from "@/modules/auth/tests/auth.mock";
import { Test } from "@nestjs/testing";
import { AuthGuard } from "@/modules/auth/guards/auth.guard";
export async function mockUserModule() {
  return await Test.createTestingModule({
    controllers: [UserController],
    providers: [
      {
        provide: "IUserService",
        useValue: mockUserService,
      },
      {
        provide: "AuthService",
        useValue: mockAuthService,
      },
    ],
  })
    .overrideGuard(AuthGuard)
    .useValue(mockAuthGuard)
    .compile();
}

export const mockUserService = {
  getUserByEmail: jest.fn(),
  blockUser: jest.fn(),
  createUser: jest.fn(),
  checkNickname: jest.fn(),
  getUserProfileById: jest.fn(),
  updateUserProfile: jest.fn(),
  getChatParticipants: jest.fn(),
};
