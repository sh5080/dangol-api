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
  PASSWORD_RESET: "password",
} as const;

export type CertificationType =
  (typeof Certification)[keyof typeof Certification];

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
