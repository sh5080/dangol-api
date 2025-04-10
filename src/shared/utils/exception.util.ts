import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { DefaultErrorMessage } from "@shared/types/message.type";

export class ExceptionUtil {
  /**
   * 단일 객체가 존재하지 않을 경우 NotFoundException을 발생시키고,
   * 존재하는 경우 non-null 타입을 보장합니다.
   */
  static default<T>(
    data: T | null | undefined,
    message: string = DefaultErrorMessage.NOT_FOUND,
    statusCode: number = 404
  ): asserts data is NonNullable<T> {
    if (!data) {
      if (statusCode === 400) {
        throw new BadRequestException(message);
      } else if (statusCode === 401) {
        throw new UnauthorizedException(message);
      } else if (statusCode === 403) {
        throw new ForbiddenException(message);
      } else if (statusCode === 409) {
        throw new ConflictException(message);
      } else {
        throw new NotFoundException(message);
      }
    }
  }

  /**
   * 배열이 비어있거나 존재하지 않을 경우 NotFoundException을 발생시키고,
   * 존재하는 경우 non-null 배열 타입을 보장합니다.
   */
  static emptyArray<T>(
    data: T[] | null | undefined,
    message: string = DefaultErrorMessage.NOT_FOUND
  ): asserts data is NonNullable<T[]> {
    if (!data || !data.length) {
      throw new NotFoundException(message);
    }
  }
}
