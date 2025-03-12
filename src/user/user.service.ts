import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";

import { CreateUserDto } from "./dtos/create-user.dto";
import { CertificationDto, UpdatePasswordDto } from "./dtos/update-user.dto";
import * as bcrypt from "bcrypt";

import { MailService } from "../mail/mail.service";
import { UserRepository } from "./user.repository";
import { UserErrorMessage } from "../types/message.type";
import { UpdateUserDto } from "./dtos/update-user.dto";
import {
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

    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException(UserErrorMessage.EMAIL_CONFLICTED);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    return await this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
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

    await this.redis.set(
      redisKey,
      verifyCode,
      "EX",
      env.mail.MAIL_VERIFY_EXPIRATION
    );
    await this.mailService.sendCertificationMail(
      email,
      verifyCode,
      Certification.SIGNUP
    );

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
