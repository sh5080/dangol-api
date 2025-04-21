import {
  CheckUserValueType,
  MailType,
  RedisKey,
  ExceptionUtil,
  UserErrorMessage,
} from "@dangol/core";
import { RedisService } from "@dangol/cache";

import { HttpStatus, Injectable } from "@nestjs/common";
import { CertificationDto, CreateUserDto } from "./dtos/create-user.dto";
import { UserRepository } from "./user.repository";
import { IUserService } from "@shared/interfaces/user.interface";
import * as bcrypt from "bcrypt";
import { UserWithoutPassword } from "./dtos/response.dto";
import { FindEmailDto } from "./dtos/get-user.dto";
import { MailService } from "../mail/mail.service";
import { UpdatePasswordDto } from "./dtos/update-user.dto";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

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
    ExceptionUtil.default(user, UserErrorMessage.USER_NOT_FOUND, 403);
    return user;
  }
  async existEmail(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    ExceptionUtil.default(!user, UserErrorMessage.EMAIL_CONFLICTED, 409);
    return true;
  }

  async createUser(dto: CreateUserDto) {
    const { email, password, isPersonalInfoCollectionAgree } = dto;
    ExceptionUtil.default(
      isPersonalInfoCollectionAgree,
      UserErrorMessage.PERSONAL_INFO_COLLECTION_AGREE_REQUIRED,
      400
    );
    await this.existEmail(email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepository.createUser({
      ...dto,
      password: hashedPassword,
    });
    return user as UserWithoutPassword;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    ExceptionUtil.default(user, UserErrorMessage.USER_NOT_FOUND);
    return user;
  }

  async findEmail(dto: FindEmailDto) {
    const user = await this.userRepository.findEmail(dto);
    ExceptionUtil.default(user, UserErrorMessage.USER_NOT_FOUND);
    return { email: user.email };
  }

  async updatePasswordCertification(dto: CertificationDto) {
    const { email, name } = dto;
    // 유저 조회
    const user = await this.getUserByEmail(email);
    // 이름 확인
    ExceptionUtil.default(user.name === name, UserErrorMessage.USER_NOT_FOUND);
    // 랜덤 숫자 생성
    const randomNumber = Math.floor(Math.random() * 1000000);
    // 메일 전송
    await this.mailService.sendMail(
      email,
      MailType.CHANGE_PASSWORD,
      randomNumber
    );
    // 랜덤 숫자 저장
    const key = this.redisService.userKey(RedisKey.RESET_PW, user.id);
    await this.redis.set(key, randomNumber.toString(), "EX", 60 * 5);
  }

  async updatePassword(dto: UpdatePasswordDto) {
    const { email, code, password, name } = dto;
    // 유저 조회
    const user = await this.getUserByEmail(email);
    // 이름 확인
    ExceptionUtil.default(user.name === name, UserErrorMessage.USER_NOT_FOUND);
    // 랜덤 숫자 조회
    const key = this.redisService.userKey(RedisKey.RESET_PW, user.id);
    const redisCode = await this.redis.get(key);
    ExceptionUtil.default(
      redisCode === code,
      UserErrorMessage.INVALID_CODE,
      HttpStatus.BAD_REQUEST
    );

    // 기존 패스워드 여부 확인
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    ExceptionUtil.default(!isPasswordMatch, UserErrorMessage.EXIST_PASSWORD);
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    // 비밀번호 업데이트
    await this.userRepository.updatePassword(email, hashedPassword);
    // 랜덤 숫자 삭제
    await this.redis.del(key);
  }

  async blockUser(id: string, reasonId: number) {
    await this.userRepository.blockUser(id, reasonId);
  }

  // async getChatParticipants(dto: GetChatParticipantsDto) {
  //   const { userIds } = dto;
  //   const participants = await this.userRepository.getChatParticipants(userIds);
  //   if (!participants || participants.length < 2) {
  //     throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND);
  //   }
  //   return participants;
  // }
}
