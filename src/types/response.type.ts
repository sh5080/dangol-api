import { ResponseStatusType } from "./enum.type";
export interface BaseResponse {
  status: ResponseStatusType;
  message?: string;
}

export interface ErrorResponse extends BaseResponse {
  details?: any;
}
export interface ReturnResponse extends BaseResponse {
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
