import { Inject, Controller, UseGuards, Req } from "@nestjs/common";
import { IUserService } from "../interfaces/user.interface";
import { CreateUserDto, CertificationDto } from "./dtos/create-user.dto";
import {
  CheckCertificationDto,
  UpdatePasswordDto,
} from "./dtos/update-user.dto";
import { UpdateUserProfileDto } from "./dtos/update-user.dto";
import { ApiTags } from "@nestjs/swagger";
import { TypedBody, TypedRoute } from "@nestia/core";
import { AuthGuard } from "../auth/auth.guard";
import { AuthRequest } from "../types/request.type";

@ApiTags("유저")
@Controller("user")
export class UserController {
  constructor(
    @Inject("IUserService") private readonly userService: IUserService
  ) {}

  /**
   * 1. userClass:class 로 네이밍 수정
   * 2. event:isEventAgree 로 네이밍 수정, 0,1 대신 true, false 사용
   * 3. authType: nucode, kakao, google, naver 사용
   * @summary 회원가입 (1차 완료) ----- 요청 값 유효성 검증 규칙 임의로 지정해놓았는데, schema에서 확인가능합니다. 바꿔야하는 부분이 있으면 알려주세요.
   * @param dto 유저 생성 dto
   * @returns 생성된 유저
   */
  @TypedRoute.Post("signup")
  async signup(@TypedBody() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  /**
   * @summary 유저 인증 이메일 발송 (1차 완료)
   * @param dto 유저 인증 이메일 발송 dto
   * @returns 인증 이메일 발송 결과
   */
  @TypedRoute.Post("certification")
  async sendCertification(@TypedBody() dto: CertificationDto) {
    return this.userService.sendCertification(dto);
  }

  /**
   * @summary 유저 인증 이메일 확인 (1차 완료)
   * @param dto 유저 인증 이메일 확인 dto
   * @returns 인증 이메일 확인 결과
   */
  @TypedRoute.Post("certification/check")
  async checkCertification(@TypedBody() dto: CheckCertificationDto) {
    return this.userService.checkCertification(dto);
  }

  /**
   * @summary 유저 비밀번호 업데이트 (완료)
   * @security bearer
   * @param dto 유저 비밀번호 업데이트 dto
   * @param req 인증 요청
   */
  @TypedRoute.Patch("password")
  @UseGuards(AuthGuard)
  async updatePassword(
    @TypedBody() dto: UpdatePasswordDto,
    @Req() req: AuthRequest
  ) {
    const userId = req.user.userId;
    return this.userService.updatePassword(userId, dto);
  }

  /**
   * @summary 유저 프로필 조회 (완료)
   * @security bearer
   * @returns 유저 프로필
   */
  @TypedRoute.Get("profile")
  @UseGuards(AuthGuard)
  async getUserProfile(@Req() req: AuthRequest) {
    const userId = req.user.userId;
    return this.userService.getUserProfileById(userId);
  }

  /**
   * @summary 유저 프로필 업데이트
   * @security bearer
   * @param dto 유저 프로필 업데이트 dto
   * @param req 인증 요청
   * @returns 업데이트된 유저 프로필
   */
  @TypedRoute.Patch("profile")
  @UseGuards(AuthGuard)
  async updateUserProfile(
    @TypedBody() dto: UpdateUserProfileDto,
    @Req() req: AuthRequest
  ) {
    const userId = req.user.userId;
    return this.userService.updateUserProfile(userId, dto);
  }
}
