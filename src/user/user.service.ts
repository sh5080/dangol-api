import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";

import { CreateUserDto } from "./dtos/create-user.dto";
import * as bcrypt from "bcrypt";

import { UserRepository } from "./user.repository";
import { DefaultErrorMessage, UserErrorMessage } from "../types/message.type";
import { UpdateUserProfileDto } from "./dtos/update-user.dto";
import {
  AUTH_PROVIDER_ID_MAP,
  CheckUserValue,
  CheckUserValueType,
} from "../types/enum.type";
import { IUserService } from "../interfaces/user.interface";

import { UserWithProfile } from "./dtos/response.dto";
import { CheckNicknameDto } from "./dtos/get-user.dto";

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}
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
    const { email, authType, nickname } = dto;
    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new ConflictException(UserErrorMessage.EMAIL_CONFLICTED);
    }
    await this.checkNickname({ nickname });

    const authProviderId = AUTH_PROVIDER_ID_MAP[authType];

    return await this.userRepository.create(dto, authProviderId);
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
