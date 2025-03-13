export const ResponseStatus = {
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type ResponseStatusType =
  (typeof ResponseStatus)[keyof typeof ResponseStatus];

export const CheckUserValue = {
  ID: "id",
  EMAIL: "email",
} as const;

export type CheckUserValueType =
  (typeof CheckUserValue)[keyof typeof CheckUserValue];

export const BlackListEnum = {
  BLACKLISTED: "blacklisted",
  NON_BLACKLISTED: "non-blacklisted",
} as const;

export type BlackListEnumType =
  (typeof BlackListEnum)[keyof typeof BlackListEnum];

export const TokenEnum = {
  ACCESS: "access",
  REFRESH: "refresh",
} as const;

export type TokenEnumType = (typeof TokenEnum)[keyof typeof TokenEnum];

export const RedisKey = {
  PW_MISMATCH_COUNT: "failedLoginAttempts",
  BLACKLIST: "blacklist",
  SESSION: "session",
  RESET_PW: "resetPw",
} as const;

export type RedisKeyType = (typeof RedisKey)[keyof typeof RedisKey];

export const BlockStatus = {
  ACTIVE: 1,
  PASSWORD_ATTEMPT_EXCEEDED: 2,
  REPORTED_MULTIPLE_TIMES: 3,
} as const;

export type BlockStatusType = (typeof BlockStatus)[keyof typeof BlockStatus];

export const Certification = {
  SIGNUP: "signup",
  PASSWORD_RESET: "passwordReset",
} as const;

export type CertificationType =
  (typeof Certification)[keyof typeof Certification];

export const AuthProvider = {
  NUCODE: "nucode",
  KAKAO: "kakao",
  GOOGLE: "google",
  NAVER: "naver",
} as const;

export const AUTH_PROVIDER_ID_MAP: Record<string, number> = {
  nucode: 0,
  kakao: 1,
  google: 2,
  naver: 3,
};

export const AUTH_PROVIDER_ID_MAP_REVERSE: Record<number, string> = {
  0: "nucode",
  1: "kakao",
  2: "google",
  3: "naver",
  4: "nucode+kakao",
  5: "nucode+google",
  6: "nucode+naver",
};

// 통합 인증 제공자 ID 맵
export const INTEGRATED_AUTH_PROVIDERS: Record<string, number[]> = {
  nucode: [0, 4, 5, 6], // nucode는 단독 또는 모든 통합 계정에서 사용 가능
  kakao: [1, 4], // kakao는 단독 또는 nucode+kakao에서 사용 가능
  google: [2, 5], // google은 단독 또는 nucode+google에서 사용 가능
  naver: [3, 6], // naver는 단독 또는 nucode+naver에서 사용 가능
};

export type AuthProviderType = (typeof AuthProvider)[keyof typeof AuthProvider];

export const SortBy = {
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
} as const;
export const SortOption = {
  LATEST: 0,
  NAME: 1,
  LIKES: 2,
} as const;
export const Order = {
  ASC: "asc",
  DESC: "desc",
} as const;
