import {
  AuthRequest,
  AuthErrorMessage,
  DefaultErrorMessage,
  BlackListEnum,
  TokenEnum,
  ExceptionUtil,
} from "@dangol/core";
import { UserPayload } from "@dangol/core/src/types/data.type";
import { AuthService } from "@dangol/cache";

import { NextFunction, Response } from "express";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { decode } from "jsonwebtoken";
import { env } from "@shared/configs/env.config";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    const response = ctx.switchToHttp().getResponse();
    const nextFunction = () => {
      return true;
    };

    try {
      await this.validateRequest(request, response, nextFunction);
      return true;
    } catch (err) {
      throw err;
    }
  }

  private async validateRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    const authorization = req.headers.authorization;
    ExceptionUtil.default(authorization, AuthErrorMessage.LOGIN_REQUIRED, 400);

    const accessToken = authorization.split("Bearer ")[1];

    ExceptionUtil.default(
      accessToken,
      AuthErrorMessage.ACCESS_TOKEN_MISSING,
      400
    );

    const accessSecret = env.auth.ACCESS_JWT_SECRET;
    try {
      const { userId, role, exp } = await this.authService.verify(
        accessToken,
        accessSecret,
        TokenEnum.ACCESS
      );
      // 토큰 만료 시간 확인
      // if (exp) {
      //   const currentTime = Math.floor(Date.now() / 1000);
      //   const remainingTime = exp - currentTime;
      //   console.log(">remainingTime: ", remainingTime);
      // }

      const blacklistData = await this.authService.getBlacklist(
        userId,
        accessToken
      );
      if (blacklistData.message === BlackListEnum.BLACKLISTED) {
        throw new ForbiddenException(DefaultErrorMessage.FORBIDDEN);
      }

      req.user = {
        userId,
        role: role!,
        tokens: { accessToken, refreshToken: "" },
      };
      next();
    } catch (err) {
      /** 리프레시 토큰 재발급
       * JWT 검증 후 UnauthorizedException 일 경우 (accessToken 만료)에만 리프레시 토큰 검증
       */
      if (err instanceof UnauthorizedException) {
        const cookies = req.headers.cookie?.split("; ") || [];
        const refreshToken = cookies
          .find((cookie) => cookie.startsWith("Refresh="))
          ?.split("=")[1] as string;
        ExceptionUtil.default(
          refreshToken,
          AuthErrorMessage.REFRESH_TOKEN_MISSING,
          401
        );
        const decodedToken = decode(accessToken);
        ExceptionUtil.default(decodedToken, AuthErrorMessage.FORBIDDEN, 403);

        const { userId, role } = decodedToken as UserPayload;
        const refreshSecret = env.auth.REFRESH_JWT_SECRET;
        await this.authService.verify(
          refreshToken,
          refreshSecret,
          TokenEnum.REFRESH,
          userId
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          await this.authService.createTokens(
            userId,
            req.ip as string,
            req.headers["user-agent"] as string
          );
        // 리프레시 후 기존 토큰 블랙리스트 처리
        await this.authService.setBlacklist(userId, accessToken);
        req.user = {
          userId,
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
          role,
        };
        // 토큰 재발급 (RTR)
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        res.cookie("Refresh", newRefreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV !== "development",
        });
        next();
      } else {
        throw err;
      }
    }
  }
}
