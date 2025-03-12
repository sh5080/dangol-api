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

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as string;

      if (message.message.includes("JSON at position")) {
        message.message = DefaultErrorMessage.SYNTAX;
      }

      if (Array.isArray(message.message)) {
        jsonRes.message = message.message[0];
      } else {
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
