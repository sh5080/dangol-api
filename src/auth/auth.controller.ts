import { Controller, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, SocialLoginDto } from "./dtos/create-auth.dto";
import { TypedBody, TypedRoute } from "@nestia/core";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";

@ApiTags("인증")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @summary 로그인
   * @param dto 로그인 dto
   * @param req 인증 요청
   * @returns 인증 결과 (accessToken, refreshToken은 response header, cookie에 포함)
   */
  @TypedRoute.Post("login")
  async login(@TypedBody() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip as string;
    const userAgent = req.headers["user-agent"] as string;
    return this.authService.authenticate(dto, ip, userAgent);
  }

  /**
   * @summary 소셜 로그인
   * @param dto 소셜 로그인 dto
   * @param req 인증 요청
   * @returns 인증 결과 (accessToken, refreshToken은 response header, cookie에 포함)
   */
  @TypedRoute.Post("login/social")
  async socialLogin(@TypedBody() dto: SocialLoginDto, @Req() req: Request) {
    const ip = req.ip as string;
    const userAgent = req.headers["user-agent"] as string;
    return this.authService.authenticate(dto, ip, userAgent);
  }
}
