import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Response } from "express";
import { Logger } from "nestjs-pino";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthRequest } from "../types/request.type";
import { ReturnResponse } from "../types/response.type";
import { ResponseStatus } from "../types/enum.type";
import { env } from "../configs/env.config";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request: AuthRequest = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((res) => {
        const response = context.switchToHttp().getResponse<Response>();

        if (response.getHeader("content-type") === "text/event-stream") {
          console.log("Sending SSE message:", res);

          return res;
        } else if (res) {
          const { accessToken, refreshToken, statusCode, ...data } =
            JSON.parse(res);
          if (accessToken && refreshToken) {
            response.setHeader("Authorization", `Bearer ${accessToken}`);
            response.cookie("Refresh", refreshToken, {
              httpOnly: true,
              secure: env.NODE_ENV !== "development",
            });
          }

          let processedData;
          if (
            data &&
            typeof data === "object" &&
            Object.keys(data).length > 0 &&
            Object.keys(data)[0] === "0"
          ) {
            processedData = Object.values(data);
          } else {
            processedData = data;
          }
          const returnData: ReturnResponse = {
            status: ResponseStatus.SUCCESS,
            data: Object.keys(data).length > 0 ? processedData : undefined,
          };
          return returnData;
        }
      })
    );
  }
}
