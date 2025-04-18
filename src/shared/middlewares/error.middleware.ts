import {
  ResponseStatus,
  ErrorResponse,
  DefaultErrorMessage,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@dangol/core";

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { Logger } from "nestjs-pino";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}
  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception;
    this.logger.error(message);

    const jsonRes: ErrorResponse = {
      status: ResponseStatus.ERROR,
      message,
    };

    const isTypiaError =
      exception.response &&
      exception.response.message &&
      exception.response.message.includes("body data is not following");

    if (isTypiaError) {
      if (exception.response && exception.response.errors) {
        const firstError = exception.response.errors[0];
        const fieldMatch = firstError.path.match(/\$input\.(\w+)/);
        const expected = firstError.expected;
        if (fieldMatch && fieldMatch[1]) {
          const fieldName = fieldMatch[1];
          jsonRes.message = `Invalid ${fieldName}: ${expected}`;
          status = HttpStatus.BAD_REQUEST;
          return response.status(status).json(jsonRes);
        }
      } else if (exception.response.reason) {
        jsonRes.message = exception.response.reason;
        status = HttpStatus.BAD_REQUEST;
        return response.status(status).json(jsonRes);
      } else {
        jsonRes.message = DefaultErrorMessage.BAD_REQUEST;
        status = HttpStatus.BAD_REQUEST;
        return response.status(status).json(jsonRes);
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
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      jsonRes.message = DefaultErrorMessage.BAD_REQUEST;
    } else if (exception instanceof PrismaClientValidationError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      jsonRes.message = DefaultErrorMessage.UNEXPECTED_1;
    } else {
      jsonRes.message = DefaultErrorMessage.UNEXPECTED_2;
    }
    return response.status(status).json(jsonRes);
  }
}
