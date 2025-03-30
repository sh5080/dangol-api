import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";

import { CreateUserDto, CertificationDto } from "./dtos/create-user.dto";
import {
  CheckCertificationDto,
  UpdatePasswordDto,
} from "./dtos/update-user.dto";
import * as bcrypt from "bcrypt";

import { MailService } from "../mail/mail.service";
import { UserRepository } from "./user.repository";
import {
  AuthErrorMessage,
  DefaultErrorMessage,
  UserErrorMessage,
} from "../types/message.type";
import { UpdateUserProfileDto } from "./dtos/update-user.dto";
import {
  AUTH_PROVIDER_ID_MAP,
  AuthProvider,
  Certification,
  CheckUserValue,
  CheckUserValueType,
} from "../types/enum.type";
import { IUserService } from "../interfaces/user.interface";
import Redis from "ioredis";
import { InjectRedis } from "@nestjs-modules/ioredis";
import { env } from "../configs/env.config";
import { RedisService } from "../redis/redis.service";
import { UserWithProfile } from "./dtos/response.dto";
import { CheckNicknameDto } from "./dtos/get-user.dto";

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
      throw new ForbiddenException(UserErrorMessage.USER_NOT_FOUND);
    }
    return user;
  }

  async checkNickname(dto: CheckNicknameDto) {
    const { nickname } = dto;
    const checkNickname = await this.userRepository.checkUserNickname(nickname);
    if (checkNickname) {
      throw new ConflictException(UserErrorMessage.NICKNAME_CONFLICTED);
    }
    return checkNickname;
  }

  async createUser(dto: CreateUserDto) {
    const { email, password, certificationCode, authType, nickname } = dto;

    // 이메일 중복 검사
    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new ConflictException(UserErrorMessage.EMAIL_CONFLICTED);
    }
    await this.checkNickname({ nickname });

    // 이메일 인증번호 체크
    if (certificationCode) {
      await this.checkCertification({
        email,
        type: Certification.SIGNUP,
        code: certificationCode,
      });
    }
    const authProviderId = AUTH_PROVIDER_ID_MAP[authType];
    // authType nucode인 경우 비밀번호 해싱 / 그 외에는 undefined
    const hashedPassword = await bcrypt.hash(password!, 10);

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
      throw new ConflictException(UserErrorMessage.EMAIL_CONFLICTED);
    } else if (type === Certification.PASSWORD_RESET && !existingUser) {
      throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND);
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
    await this.mailService.sendCertificationMail(email, verifyCode, type);

    return;
  }

  async checkCertification(dto: CheckCertificationDto) {
    const { email, type, code } = dto;

    const redisKey = this.redisService.certificationKey(type, email);
    const storedCode = await this.redis.get(redisKey);
    if (!storedCode) {
      throw new NotFoundException("이메일 인증이 선행되어야 합니다.");
    }
    if (storedCode !== code) {
      throw new BadRequestException(UserErrorMessage.INVALID_CODE);
    }
    // 인증한 이후 코드 만료 시간 연장
    await this.redis.expire(redisKey, env.auth.AFTER_MAIL_VERIFY_EXPIRATION);
    return;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND);
    }

    return user;
  }

  async getUserProfileById(id: string) {
    await this.checkUser(CheckUserValue.ID, id);
    const userProfile = await this.userRepository.getUserProfileById(id);
    if (!userProfile) {
      throw new NotFoundException(
        "유저 프로필" + DefaultErrorMessage.NOT_FOUND
      );
    }
    return userProfile as UserWithProfile;
  }

  async updateUserProfile(id: string, dto: UpdateUserProfileDto) {
    await this.checkUser(CheckUserValue.ID, id);

    const userProfile = await this.userRepository.updateUserProfile(id, dto);
    if (!userProfile) {
      throw new NotFoundException(
        "유저 프로필" + DefaultErrorMessage.NOT_FOUND
      );
    }
    return userProfile as UserWithProfile;
  }

  async blockUser(id: string, reasonId: number) {
    await this.userRepository.blockUser(id, reasonId);
  }
}
