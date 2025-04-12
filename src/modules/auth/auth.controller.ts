import { Controller, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/create-auth.dto";
import { TypedBody, TypedRoute } from "@nestia/core";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AuthGuard } from "./guards/auth.guard";
import { AuthRequest } from "@shared/types/request.type";

@ApiTags("인증")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @summary 로그인
   * @param dto 로그인 dto
   * @param req 인증 요청
   * @returns 인증 결과 (accessToken, refreshToken은 response header, cookie에 포함)
   * @throws 401 비밀번호 불일치
   * @throws 403 계정 제한 (비밀번호 불일치 5회)
   * @throws 404 유저 없음 (이메일 불일치)
   * @throws 405 인증방법 불일치 (kakao / google)
   */
  @TypedRoute.Post("login")
  async login(@TypedBody() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip as string;
    const userAgent = req.headers["user-agent"] as string;
    return this.authService.authenticate(dto, ip, userAgent);
  }

  /**
   * @summary 토큰 검증
   * @security bearer
   * @returns 토큰 검증 결과 true/false
   * @throws 400 Authorization 헤더 없는 경우 / access 토큰 없는 경우
   * @throws 401 만료된 토큰 (재 로그인 필요)
   * @throws 403 유효하지 않은 토큰 / 폐기된 토큰
   */
  @TypedRoute.Get("token")
  @UseGuards(AuthGuard)
  async token() {
    return true;
  }

  /**
   * @summary 로그아웃
   * @security bearer
   * @returns 로그아웃 결과 true
   * @throws 400 Authorization 헤더 없는 경우 / access 토큰 없는 경우
   */
  @TypedRoute.Post("logout")
  @UseGuards(AuthGuard)
  async logout(@Req() req: AuthRequest) {
    const { userId, tokens } = req.user;
    return this.authService.logout(userId, tokens!.accessToken);
  }

  /**
   * @summary 로그인 (유효기간 없는 토큰 제공)
   * @param dto 로그인 dto
   * @param req 인증 요청
   * @returns 인증 결과 (accessToken, refreshToken은 response header, cookie에 포함)
   * @throws 401 비밀번호 불일치
   * @throws 403 계정 제한 (비밀번호 불일치 5회)
   * @throws 404 유저 없음 (이메일 불일치)
   * @throws 405 인증방법 불일치 (kakao / google)
   */
  @TypedRoute.Post("login/test")
  async testLogin(@TypedBody() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip as string;
    const userAgent = req.headers["user-agent"] as string;
    return this.authService.authenticate(dto, ip, userAgent, true);
  }
}
