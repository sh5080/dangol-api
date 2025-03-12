import {
  Inject,
  Controller,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { IUserService } from "../interfaces/user.interface";
import { CreateUserDto, CertificationDto } from "./dtos/create-user.dto";
import {
  CheckCertificationDto,
  UpdatePasswordDto,
} from "./dtos/update-user.dto";
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
   * @summary 회원가입 (완료)
   * @param dto 유저 생성 dto
   * @returns 생성된 유저
   */
  @TypedRoute.Post("signup")
  async signup(@TypedBody() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  /**
   * @summary 유저 인증 이메일 발송 (완료)
   * @param dto 유저 인증 이메일 발송 dto
   * @returns 인증 이메일 발송 결과
   */
  @TypedRoute.Post("certification")
  async sendCertification(@TypedBody() dto: CertificationDto) {
    return this.userService.sendCertification(dto);
  }

  /**
   * @summary 유저 인증 이메일 확인 (완료)
   * @param dto 유저 인증 이메일 확인 dto
   * @returns 인증 이메일 확인 결과
   */
  @TypedRoute.Post("certification/check")
  async checkCertification(@TypedBody() dto: CheckCertificationDto) {
    return this.userService.checkCertification(dto);
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
