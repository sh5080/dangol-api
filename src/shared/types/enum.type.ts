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

export interface Blacklist {
  logoutTime?: string;
  accessToken: string;
}
export const BlackListEnum = {
  BLACKLISTED: true,
  NON_BLACKLISTED: false,
} as const;

export type BlackListEnumType =
  (typeof BlackListEnum)[keyof typeof BlackListEnum];

export interface BlackListStatus {
  message: BlackListEnumType;
}
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

export const MailType = {
  SIGNUP: "signup",
  CHANGE_PASSWORD: "changePassword",
  RESTAURANT_APPROVED: "restaurantApproved",
} as const;

export type SendMailType = (typeof MailType)[keyof typeof MailType];

export const AuthProvider = {
  KAKAO: "kakao",
  GOOGLE: "google",
} as const;

export const AUTH_PROVIDER_ID_MAP: Record<string, number> = {
  kakao: 1,
  google: 2,
};

export const AUTH_PROVIDER_ID_MAP_REVERSE: Record<number, string> = {
  1: "kakao",
  2: "google",
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

export const Permission = {
  POST: "post",
} as const;
