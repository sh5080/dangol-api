import { NextFunction, Response } from "express";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { AuthRequest } from "../types/request.type";
import { AuthService } from "./auth.service";
import { AuthErrorMessage, DefaultErrorMessage } from "../types/message.type";
import { decode } from "jsonwebtoken";
import { env } from "../configs/env.config";
import { BlackListEnum, TokenEnum } from "../types/enum.type";
import { UserPayload } from "../types/data.type";

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
    console.log(">req.url: ", req.url);
    console.log(">req.headers: ", req.headers);

    if (!authorization) {
      throw new BadRequestException(AuthErrorMessage.LOGIN_REQUIRED);
    }

    const accessToken = authorization.split("Bearer ")[1];
    if (!accessToken) {
      throw new BadRequestException(AuthErrorMessage.ACCESS_TOKEN_MISSING);
    }

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

      req.user = { userId, role, tokens: { accessToken, refreshToken: "" } };
      next();
    } catch (err) {
      /** 리프레시 토큰 재발급
       * JWT 검증 후 UnauthorizedException 일 경우 (accessToken 만료)에만 리프레시 토큰 검증
       */
      if (err instanceof UnauthorizedException) {
        const cookies = req.headers.cookie?.split("; ") || [];
        const refreshToken = cookies
          .find((cookie) => cookie.startsWith("refresh="))
          ?.split("=")[1] as string;
        if (!refreshToken) {
          throw new UnauthorizedException(
            AuthErrorMessage.REFRESH_TOKEN_MISSING
          );
        }
        const decodedToken = decode(accessToken);
        if (!decodedToken) {
          throw new ForbiddenException(AuthErrorMessage.FORBIDDEN);
        }
        const userId = (decodedToken as UserPayload).userId;
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

        req.user = {
          userId,
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        };
        // 토큰 재발급 (RTR)
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        res.cookie("refresh", newRefreshToken, {
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
