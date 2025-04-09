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

export interface SearchResult<T> {
  items: T[];
  totalItems: number;
}
export interface UserPayload {
  userId: string;
}

export interface MetricConfig {
  name: string;
  help: string;
  type: "histogram" | "counter";
}
