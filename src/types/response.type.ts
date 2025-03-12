import { ResponseStatusType } from "./enum.type";

export interface ReturnResponse {
  status: ResponseStatusType;
  message?: string;
  data?: any;
}

export const ResponseMessage = {
  OK: "request success.",
  CREATED: "resource created successfully.",
  DEFAULT: "request processed successfully.",
} as const;

export interface SSEResponse<T> {
  message: string;
  data: T;
}
