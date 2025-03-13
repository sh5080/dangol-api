import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";

import { CreateUserDto, CertificationDto } from "./dtos/create-user.dto";
import {
  CheckCertificationDto,
  UpdatePasswordDto,
} from "./dtos/update-user.dto";
import * as bcrypt from "bcrypt";

import { MailService } from "../mail/mail.service";
import { UserRepository } from "./user.repository";
import { UserErrorMessage } from "../types/message.type";
import { UpdateUserDto } from "./dtos/update-user.dto";
import {
  AUTH_PROVIDER_ID_MAP,
  Certification,
  CheckUserValue,
  CheckUserValueType,
} from "../types/enum.type";
import { IUserService } from "../interfaces/user.interface";
import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { env } from "../configs/env.config";
import { RedisService } from "../redis/redis.service";
@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    @InjectRedis() private readonly redis: Redis,
    private readonly redisService: RedisService
  ) {}
  async checkUser(key: CheckUserValueType, value: string) {
    const user = await this.userRepository.checkUserByValue(key, value);
    if (!user) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND);
    }
    return user;
  }

  async createUser(dto: CreateUserDto) {
    const { email, password } = dto;

    // 이메일 중복 검사
    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException(UserErrorMessage.EMAIL_CONFLICTED);
    }

    // 이메일 인증번호 체크
    await this.checkCertification({
      email,
      type: Certification.SIGNUP,
      code: dto.certificationCode,
    });

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    const authProviderId = AUTH_PROVIDER_ID_MAP[dto.authType];
    // 유저 생성
    const createdUser = await this.userRepository.create(
      { ...dto, password: hashedPassword },
      authProviderId
    );

    // 인증번호 삭제
    const redisKey = this.redisService.certificationKey(
      Certification.SIGNUP,
      email
    );
    await this.redis.del(redisKey);
    return createdUser;
  }

  async sendCertification(dto: CertificationDto) {
    const { email, type } = dto;
    const existingUser = await this.userRepository.getUserByEmail(email);

    // 이메일 유효성 검증
    if (type === Certification.SIGNUP && existingUser) {
      throw new BadRequestException(UserErrorMessage.EMAIL_CONFLICTED);
    } else if (type === Certification.PASSWORD_RESET && !existingUser) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND);
    }

    // 인증번호 생성 및 이메일 전송
    const verifyCode =
      Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
    const redisKey = this.redisService.certificationKey(type, email);

    // 인증번호 저장
    await this.redis.set(
      redisKey,
      verifyCode,
      "EX",
      env.auth.MAIL_VERIFY_EXPIRATION
    );

    // 인증번호 이메일 전송
    await this.mailService.sendCertificationMail(
      email,
      verifyCode,
      Certification.SIGNUP
    );

    return;
  }

  async checkCertification(dto: CheckCertificationDto) {
    const { email, type, code } = dto;

    const redisKey = this.redisService.certificationKey(type, email);
    const storedCode = await this.redis.get(redisKey);
    if (!storedCode) {
      throw new BadRequestException("Email must be verified.");
    }
    if (storedCode !== code) {
      throw new BadRequestException(UserErrorMessage.INVALID_CODE);
    }
    // 인증한 이후 코드 만료 시간 연장
    await this.redis.expire(redisKey, env.auth.AFTER_MAIL_VERIFY_EXPIRATION);
    return;
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const { password } = dto;

    // 사용자 조회
    await this.checkUser(CheckUserValue.ID, id);

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 비밀번호 업데이트
    await this.userRepository.updatePassword(id, hashedPassword);
    return;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND);
    }

    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    await this.checkUser(CheckUserValue.ID, id);

    return await this.userRepository.updateUser(id, dto);
  }
}
