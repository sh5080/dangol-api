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
   * 1. userClass:class 로 네이밍 수정
   * 2. event:isEventAgree 로 네이밍 수정, 0,1 대신 true, false 사용
   * 3. authType: nucode, kakao, google, naver 사용
   * @summary 회원가입 (1차 완료) ----- 요청 값 유효성 검증 규칙 임의로 지정해놓았는데, schema에서 확인가능합니다. 바꿔야하는 부분이 있으면 알려주세요.
   * @param dto 유저 생성 dto
   * @returns 생성된 유저
   * @throws 409 이메일 중복
   * @throws 403 authType nucode인 경우 이메일 인증이 선행되어야 합니다. (인증번호 미입력)
   * @throws 404 이메일에 해당하는 인증번호가 없음(인증번호 선행하지 않거나 이메일 발송 전후 관련 오류)
   * @throws 400 이메일 인증 코드 불일치
   */
  @TypedRoute.Post("signup")
  async signup(@TypedBody() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  /**
   * @summary 유저 인증 이메일 발송 (1차 완료)
   * @param dto 유저 인증 이메일 발송 dto
   * @returns 인증 이메일 발송 결과
   * @throws 409 이메일 중복 (회원가입시 발생)
   * @throws 404 조회된 유저가 없습니다. (비밀번호 재설정시 발생)

   */
  @TypedRoute.Post("certification")
  async sendCertification(@TypedBody() dto: CertificationDto) {
    return this.userService.sendCertification(dto);
  }

  /**
   * @summary 유저 인증 이메일 확인 (1차 완료)
   * @param dto 유저 인증 이메일 확인 dto
   * @returns 인증 이메일 확인 결과
   * @throws 404 이메일에 해당하는 인증번호가 없음(인증번호 선행하지 않거나 이메일 발송 전후 관련 오류)
   * @throws 400 이메일 인증 코드 불일치
   */
  @TypedRoute.Post("certification/check")
  async checkCertification(@TypedBody() dto: CheckCertificationDto) {
    return this.userService.checkCertification(dto);
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
   * @summary 유저 비밀번호 업데이트 (완료)
   * @param dto 유저 비밀번호 업데이트 dto
   * @param req 인증 요청
   * @throws 404 유저 없음 (이메일 불일치)
   * @throws 403 소셜로그인(누코드 통합x) 사용자가 비밀번호 재설정 시도
   * @throws 404 이메일 인증이 선행되어야 합니다.
   * @throws 400 이메일 인증 코드 불일치
   * @throws 400 동일한 패스워드는 입력할 수 없습니다.
   */
  @TypedRoute.Patch("password")
  async updatePassword(
    @TypedBody() dto: UpdatePasswordDto,
    @Req() req: AuthRequest
  ) {
    return this.userService.updatePassword(dto);
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
