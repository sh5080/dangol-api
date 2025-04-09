import { Injectable } from "@nestjs/common";
import { Format } from "typia/lib/tags";
import { CertificationType, RedisKeyType } from "../types/enum.type";

@Injectable()
export class RedisService {
  /** 인증 Redis key
   * @params type: CertificationType
   * @params email: string & Format<"email">
   */
  certificationKey(
    type: CertificationType,
    email: string & Format<"email">
  ): string {
    return `certification:${type}:${email}`;
  }

  /** 회원 Redis key
   * @params type: RedisKeyType
   * @params userId: string
   */
  userKey(type: RedisKeyType, userId: string): string {
    return `user:${type}:${userId}`;
  }
}
