import { UserController } from "../user.controller";
import { mockAuthService, mockAuthGuard } from "@/modules/auth/tests/auth.mock";
import { Test } from "@nestjs/testing";
import { AuthGuard } from "@/modules/auth/guards/auth.guard";
import { UserService } from "../user.service";
import { UserRepository } from "../user.repository";

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
export async function mockUserServiceModule() {
  return await Test.createTestingModule({
    providers: [
      UserService,
      {
        provide: UserRepository,
        useValue: mockUserRepository,
      },
    ],
  }).compile();
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

export const mockUserRepository = {
  checkUserByValue: jest.fn(),
  checkUserNickname: jest.fn(),
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  getUserProfileById: jest.fn(),
  updateUserProfile: jest.fn(),
  blockUser: jest.fn(),
  getChatParticipants: jest.fn(),
};
