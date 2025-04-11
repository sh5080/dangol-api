import {
  Inject,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { LoginDto } from "./dtos/create-auth.dto";
import {
  AuthErrorMessage,
  TokenErrorMessage,
} from "@shared/types/message.type";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { IUserService } from "@shared/interfaces/user.interface";
import { Logger } from "nestjs-pino";
import {
  BlockStatus,
  RedisKey,
  TokenEnum,
  TokenEnumType,
  BlackListEnum,
  BlackListStatus,
  Blacklist,
} from "@shared/types/enum.type";
import { Token, UserPayload } from "@shared/types/data.type";
import Redis from "ioredis";
import { env } from "@shared/configs/env.config";
import { RedisService } from "@core/redis/redis.service";
import { ExceptionUtil } from "@/shared/utils/exception.util";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @Inject("IUserService") private readonly userService: IUserService,
    @InjectRedis() private readonly redis: Redis,
    private readonly redisService: RedisService,
    private readonly logger: Logger
  ) {}

  async authenticate(
    dto: LoginDto,
    ip: string,
    userAgent: string,
    isTest?: boolean
  ) {
    const { email, password } = dto;

    const user = await this.userService.getUserByEmail(email);
    // 제한된 계정 로그인 불가
    ExceptionUtil.default(user.isActive, AuthErrorMessage.ACCOUNT_BLOCKED, 403);

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    // 비밀번호 불일치 시 로그인 시도 횟수 증가
    if (!isPasswordMatch) {
      await this.incrementFailedLoginAttempts(user.id);
    }

    const tokens = await this.createTokens(
      user.id,
      ip,
      userAgent,
      user.role,
      isTest
    );
    // 정상 로그인시 로그인 시도 횟수 초기화
    await this.resetFailedLoginAttempts(user.id);

    return { user, ...tokens };
  }

  async incrementFailedLoginAttempts(userId: string) {
    const failedAttemptsKey = this.redisService.userKey(
      RedisKey.PW_MISMATCH_COUNT,
      userId
    );

    const maxAttempts = 5;
    const attempts = await this.redis.get(failedAttemptsKey);

    if (attempts) {
      const attemptsCount = parseInt(attempts, 10);
      if (attemptsCount > maxAttempts - 1) {
        const reasonId = BlockStatus.PASSWORD_ATTEMPT_EXCEEDED;
        await this.userService.blockUser(userId, reasonId);
        throw new UnauthorizedException(AuthErrorMessage.ACCOUNT_BLOCKED);
      }
      await this.redis.incr(failedAttemptsKey);
      throw new UnauthorizedException(
        AuthErrorMessage.PASSWORD_MISMATCH +
          AuthErrorMessage.MISMATCH_COUNTED +
          ` ${attemptsCount + 1} / ${maxAttempts},`
      );
    } else {
      await this.redis.set(failedAttemptsKey, "1");
      throw new UnauthorizedException(
        AuthErrorMessage.PASSWORD_MISMATCH +
          AuthErrorMessage.MISMATCH_COUNTED +
          ` 1 / ${maxAttempts}`
      );
    }
  }
  async resetFailedLoginAttempts(userId: string) {
    const failedAttemptsKey = this.redisService.userKey(
      RedisKey.PW_MISMATCH_COUNT,
      userId
    );
    await this.redis.del(failedAttemptsKey);
  }
  async setBlacklist(
    userId: string,
    accessToken: string
  ): Promise<BlackListStatus> {
    const key = this.redisService.userKey(RedisKey.BLACKLIST, userId);

    await this.redis.hmset(
      key,
      "accessToken",
      accessToken,
      "time",
      new Date().toISOString()
    );

    await this.redis.expire(key, env.auth.ACCESS_JWT_EXPIRATION);
    return { message: BlackListEnum.BLACKLISTED };
  }

  async getBlacklist(userId: string, token: string): Promise<BlackListStatus> {
    const logoutRedis = await this.redis.hgetall(
      this.redisService.userKey(RedisKey.BLACKLIST, userId)
    );
    const { accessToken } = logoutRedis;
    const blacklist: Blacklist = { accessToken: accessToken };

    let response: BlackListStatus = { message: BlackListEnum.BLACKLISTED };
    if (blacklist.accessToken === token) {
      response.message = BlackListEnum.BLACKLISTED;
    } else response.message = BlackListEnum.NON_BLACKLISTED;
    return response;
  }

  async createTokens(
    userId: string,
    ip: string,
    userAgent: string,
    role?: string | null,
    isTest?: boolean
  ): Promise<Token> {
    const accessTokenPayload = { userId, role };
    const refreshTokenPayload = { uuid: crypto.randomUUID() };

    const accessToken = jwt.sign(
      accessTokenPayload,
      !isTest ? env.auth.ACCESS_JWT_SECRET : "99999999999999999999999999999999",
      {
        expiresIn: env.auth.ACCESS_JWT_EXPIRATION,
        audience: "dangol-api",
        issuer: "jjindangol@gmail.com",
      }
    );
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      !isTest
        ? env.auth.REFRESH_JWT_SECRET
        : "99999999999999999999999999999999",
      {
        expiresIn: env.auth.REFRESH_JWT_EXPIRATION,
        audience: "dangol-api",
        issuer: "jjindangol@gmail.com",
      }
    );
    const sessionKey = this.redisService.userKey(RedisKey.SESSION, userId);
    await this.redis.hmset(
      sessionKey,
      "userId",
      userId,
      "refreshToken",
      refreshToken,
      "ip",
      ip,
      "userAgent",
      userAgent
    );

    await this.redis.expire(sessionKey, env.auth.REFRESH_JWT_EXPIRATION);
    return { accessToken, refreshToken };
  }

  async verify(
    jwtString: string,
    secret: string,
    type: TokenEnumType,
    userId?: string
  ) {
    try {
      if (type === TokenEnum.REFRESH) {
        ExceptionUtil.default(userId, AuthErrorMessage.SESSION_NOT_FOUND, 401);

        const sessionKey = this.redisService.userKey(RedisKey.SESSION, userId);
        const redisSession = await this.redis.hgetall(sessionKey);

        if (!redisSession || Object.keys(redisSession).length === 0) {
          throw new UnauthorizedException(AuthErrorMessage.SESSION_NOT_FOUND);
        }

        if (redisSession.refreshToken !== jwtString) {
          throw new UnauthorizedException(TokenErrorMessage.TOKEN_INVALID);
        }
        const { userId: redisUserId } = redisSession;
        return { userId: redisUserId };
      } else {
        const payload = jwt.verify(jwtString, secret, {
          algorithms: ["HS256"],
        }) as jwt.JwtPayload & UserPayload;
        const { userId, role, exp } = payload;
        return { userId, role, exp };
      }
    } catch (err) {
      this.logger.error(err);
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(TokenErrorMessage.TOKEN_EXPIRED);
      } else if (err instanceof jwt.JsonWebTokenError) {
        throw new ForbiddenException(TokenErrorMessage.TOKEN_INVALID);
      } else {
        throw err;
      }
    }
  }

  async logout(userId: string, accessToken: string) {
    const sessionKey = this.redisService.userKey(RedisKey.SESSION, userId);
    await this.redis.del(sessionKey);
    await this.setBlacklist(userId, accessToken);
    return true;
  }
}
