import { User } from "@prisma/client";
import { UserWithProfile } from "../../user/dtos/response.dto";

// 기본 사용자 모킹 데이터
export const mockUser: User = {
  id: "123",
  email: "test@example.com",
  password: "hashedpassword",
  name: "testuser",
  authProviderId: 1,
  phoneNumber: "01012345678",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// 프로필 포함 사용자
export const mockUserWithProfile = {
  ...mockUser,
  profile: {
    id: 1,
    userId: "123",
    nickname: "testuser",
    introduction: "테스트 소개",
    interests: "테스트 관심사",
    image: "https://example.com/avatar.jpg",
    affiliation: "테스트 소속",
    class: "테스트 학력/직장",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  events: [],
  permissions: [],
} as UserWithProfile;

// 팩토리 함수 - 커스텀 데이터로 모킹 객체 생성
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  ...mockUser,
  ...overrides,
});

export const createMockUserWithProfile = (
  overrides: Partial<UserWithProfile> = {}
): UserWithProfile => ({
  ...mockUserWithProfile,
  ...overrides,
});
