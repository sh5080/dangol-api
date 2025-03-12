import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { Response } from "express";
import { Logger } from "nestjs-pino";
import { ReturnResponse } from "../types/response.type";
import { ResponseStatus } from "../types/enum.type";
import { DefaultErrorMessage } from "../types/message.type";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}
  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception;
    this.logger.error(message);
    console.error("error in middleware: ", message);

    const jsonRes: ReturnResponse = {
      status: ResponseStatus.ERROR,
      message,
    };

    const isTypiaError =
      exception.response &&
      exception.response.message &&
      exception.response.message.startsWith("Request body data");

    if (isTypiaError) {
      const firstError = exception.response.errors[0];
      if (firstError && firstError.path) {
        const fieldMatch = firstError.path.match(/\$input\.(\w+)/);
        if (fieldMatch && fieldMatch[1]) {
          const fieldName = fieldMatch[1];
          jsonRes.message = `Invalid ${fieldName}`;
          status = HttpStatus.BAD_REQUEST;
          return response.status(status).json(jsonRes);
        }
      }
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as string;

      if (
        message.message &&
        typeof message.message === "string" &&
        message.message.includes("JSON at position")
      ) {
        message.message = DefaultErrorMessage.SYNTAX;
      }

      if (message.message && Array.isArray(message.message)) {
        jsonRes.message = message.message[0];
      } else if (message.message) {
        jsonRes.message = message.message;
      }
    } else if (
      exception instanceof PrismaClientKnownRequestError ||
      exception instanceof PrismaClientValidationError
    ) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      jsonRes.message = DefaultErrorMessage.UNEXPECTED_1;
    } else {
      jsonRes.message = DefaultErrorMessage.UNEXPECTED_2;
    }
    return response.status(status).json(jsonRes);
  }
}
