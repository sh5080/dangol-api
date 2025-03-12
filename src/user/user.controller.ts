import {
  Inject,
  Controller,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { IUserService } from "../interfaces/user.interface";
import { CreateUserDto } from "./dtos/create-user.dto";
import { CertificationDto, UpdatePasswordDto } from "./dtos/update-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "../upload/upload.service";
import * as jwt from "jsonwebtoken";
import { ApiTags } from "@nestjs/swagger";
import {
  TypedBody,
  TypedFormData,
  TypedHeaders,
  TypedRoute,
} from "@nestia/core";
import { AuthGuard } from "../auth/auth.guard";
import { AuthRequest } from "../types/request.type";
import Multer from "multer";

@ApiTags("유저")
@Controller("user")
export class UserController {
  private readonly secretKey = "nucode";

  constructor(
    @Inject("IUserService") private readonly userService: IUserService,
    private readonly uploadService: UploadService
  ) {}

  /**
   * 제가 설계방향을 잘 몰라서 그러는데, 확장성 & 보안을 어디까지 신경써야할지에 대해 고민입니다.
   * 1. 서비스가 현재 운영중인가요?
   * 2. 변동/확장성을 고려하면 affiliation, userClass값은 정규화하는게 좋아보이긴 하는데, 지금처럼 string으로 바로 저장할까요? (서비스가 이미 운영중이고 프론트도 해당 값을 이용하는 빈도가 크면 일단 그대로 두는게 좋아보이긴 합니다.)
   * 3. event값은 별도로 릴레이션 설정된 테이블이 있나요? 어떤 값인지 궁금합니다.
   * 4. 이메일, 휴대폰번호는 암/복호화에 리소스가 크지 않아서 진행하려는데 괜찮을까요? (서비스 커지면 암호화 필요할텐데 그때 기존 값을 암호화해놓는거보단 미리 해놓는게 좋지 않을까 해서요~!)
   * 5. 이러한 고민들을 제가 단독적으로 결정을 해야 하는 부분인지 궁금합니다.
   *
   * @summary 회원가입(완료) ------- 질문 있습니다
   * @param dto 유저 생성 dto
   * @returns 생성된 유저
   */
  @TypedRoute.Post("signup")
  async signup(@TypedBody() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  /**
   * @summary 유저 인증 이메일 발송
   * @param dto 유저 인증 이메일 발송 dto
   * @returns 인증 이메일 발송 결과
   */
  @TypedRoute.Post("certification")
  async sendCertification(@TypedBody() dto: CertificationDto) {
    return this.userService.sendCertification(dto);
  }

  /**
   * @summary 유저 비밀번호 업데이트
   * @param dto 유저 비밀번호 업데이트 dto
   * @param req 인증 요청
   * @returns 업데이트된 유저 비밀번호
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
   * @summary 유저 정보 조회
   * @param headers 인증 헤더
   * @returns 유저 정보
   */
  @TypedRoute.Get()
  @UseGuards(AuthGuard)
  async getUser(@TypedHeaders() headers: { Authorization: string }) {
    const token = headers.Authorization;
    if (!token) {
      return { message: "not found" };
    }

    try {
      const decoded = jwt.verify(token, this.secretKey) as { email: string };
      return this.userService.getUserByEmail(decoded.email);
    } catch (error) {
      throw new BadRequestException("유효하지 않은 토큰입니다.");
    }
  }

  /**
   * @summary 유저 프로필 업데이트
   * @param dto 유저 프로필 업데이트 dto
   * @param req 인증 요청
   * @param file 썸네일 파일
   * @returns 업데이트된 유저 프로필
   */
  @TypedRoute.Patch()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("thumbnail"))
  async updateUserProfile(
    @TypedFormData.Body(() => Multer()) dto: UpdateUserDto,
    @Req() req: AuthRequest
  ) {
    const userId = req.user.userId;
    return this.userService.updateUser(userId, dto);
  }
}
