import {
  Inject,
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { LoginDto } from "./dtos/create-auth.dto";
import {
  AuthErrorMessage,
  TokenErrorMessage,
  UserErrorMessage,
} from "../types/message.type";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { IUserService } from "../interfaces/user.interface";
import { Logger } from "nestjs-pino";
import {
  AUTH_PROVIDER_ID_MAP_REVERSE,
  BlockStatus,
  RedisKey,
  TokenEnum,
  TokenEnumType,
  BlackListEnum,
  BlackListStatus,
  Blacklist,
  AUTH_PROVIDER_ID_MAP,
} from "../types/enum.type";
import { Token, UserPayload } from "../types/data.type";
import Redis from "ioredis";
import { env } from "../configs/env.config";
import { RedisService } from "../redis/redis.service";
import { UserWithoutPassword } from "../user/dtos/response.dto";

@Injectable()
export class AuthService {
  constructor(
    @Inject("IUserService") private readonly userService: IUserService,
    @InjectRedis() private readonly redis: Redis,
    private readonly redisService: RedisService,
    private readonly logger: Logger
  ) {}

  async authenticate(dto: LoginDto, ip: string, userAgent: string) {
    const { email, authType } = dto;

    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND);
    }
    // 가입되어 있는 authType이 호환되지 않는 경우
    if (AUTH_PROVIDER_ID_MAP[authType] !== user.authProviderId) {
      throw new ForbiddenException(
        `로그인 가능한 인증방법: ${AUTH_PROVIDER_ID_MAP_REVERSE[user.authProviderId]}`
      );
    }

    const tokens = await this.createTokens(
      user.id,
      ip,
      userAgent,
      user.role?.role
    );
    await this.resetFailedLoginAttempts(user.id);

    return { user: user as UserWithoutPassword, ...tokens };
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
    role?: string | null
  ): Promise<Token> {
    const accessTokenPayload = { userId, role };
    const refreshTokenPayload = { uuid: crypto.randomUUID() };

    const accessToken = jwt.sign(
      accessTokenPayload,
      env.auth.ACCESS_JWT_SECRET,
      {
        expiresIn: env.auth.ACCESS_JWT_EXPIRATION,
        audience: "boilerplate-api",
        issuer: "boilerplate",
      }
    );
    const refreshToken = jwt.sign(
      refreshTokenPayload,
      env.auth.REFRESH_JWT_SECRET,
      {
        expiresIn: env.auth.REFRESH_JWT_EXPIRATION,
        audience: "boilerplate-api",
        issuer: "boilerplate",
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
        if (!userId) {
          throw new UnauthorizedException(AuthErrorMessage.SESSION_NOT_FOUND);
        }
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
}
