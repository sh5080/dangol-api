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
import { AuthGuard } from "../auth/guards/auth.guard";
import { AuthRequest } from "../types/request.type";
import { CheckNicknameDto } from "./dtos/get-user.dto";

@ApiTags("유저")
@Controller("user")
export class UserController {
  constructor(
    @Inject("IUserService") private readonly userService: IUserService
  ) {}

  /**
   * @summary 회원가입
   * @param dto 유저 생성 dto
   * @returns 생성된 유저
   * @throws 409 이메일 중복
   * @throws 404 이메일에 해당하는 인증번호가 없음(인증번호 선행하지 않거나 이메일 발송 전후 관련 오류)
   * @throws 400 이메일 인증 코드 불일치
   */
  @TypedRoute.Post("signup")
  async signup(@TypedBody() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  /**
   * @summary 닉네임 중복 확인 (1차 완료)
   * @param dto 닉네임 중복 확인 dto
   * @returns 닉네임 중복 확인 결과
   * @throws 409 닉네임 중복
   */
  @TypedRoute.Post("nickname/check")
  async checkNickname(@TypedBody() dto: CheckNicknameDto) {
    return this.userService.checkNickname(dto);
  }

  /**
   * @summary 유저 프로필 조회 (완료)
   * @security bearer
   * @returns 유저 프로필
   * @throws 403 조회된 유저가 없습니다. (정상 작동이면 가능하지 않음)
   * @throws 404 유저 프로필 없음 (회원가입시 프로필 동시에 생성해서 사실상 이 오류가 나올 일은 없습니다.)
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
   * @throws 403 조회된 유저가 없습니다. (정상 작동이면 가능하지 않음)
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
