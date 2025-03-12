export interface Session {
  ip: string;
  userId: number;
  userAgent: string;
  lastLoginTime: Date;
  refreshToken: string;
}

export interface Token {
  accessToken: string;
  refreshToken: string;
}

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

export interface SearchResult<T> {
  items: T[];
  totalItems: number;
}
export interface UserPayload {
  userId: string;
}
