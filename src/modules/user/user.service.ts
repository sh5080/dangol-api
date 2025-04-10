import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UserRepository } from "./user.repository";
import { UserErrorMessage } from "@shared/types/message.type";
import { UpdateUserProfileDto } from "./dtos/update-user.dto";
import {
  AUTH_PROVIDER_ID_MAP,
  CheckUserValue,
  CheckUserValueType,
} from "@shared/types/enum.type";
import { IUserService } from "@shared/interfaces/user.interface";
import { UserWithProfile } from "./dtos/response.dto";
import { CheckNicknameDto, GetChatParticipantsDto } from "./dtos/get-user.dto";
import { ExceptionUtil } from "@/shared/utils/exception.util";

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}
  async checkUser(key: CheckUserValueType, value: string) {
    const user = await this.userRepository.checkUserByValue(key, value);
    ExceptionUtil.default(user, UserErrorMessage.USER_NOT_FOUND, 403);
    return user;
  }

  async checkNickname(dto: CheckNicknameDto) {
    const { nickname } = dto;
    const isExist = await this.userRepository.checkUserNickname(nickname);
    ExceptionUtil.default(!isExist, UserErrorMessage.NICKNAME_CONFLICTED, 409);
    return isExist;
  }

  async createUser(dto: CreateUserDto) {
    const { email, authType, nickname } = dto;
    const isExist = await this.userRepository.getUserByEmail(email);
    ExceptionUtil.default(!isExist, UserErrorMessage.EMAIL_CONFLICTED, 409);
    await this.checkNickname({ nickname });

    const authProviderId = AUTH_PROVIDER_ID_MAP[authType];
    return await this.userRepository.createUser(dto, authProviderId);
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    ExceptionUtil.default(user, UserErrorMessage.USER_NOT_FOUND);
    return user;
  }

  async getUserProfileById(id: string) {
    await this.checkUser(CheckUserValue.ID, id);
    const userProfile = await this.userRepository.getUserProfileById(id);
    ExceptionUtil.default(userProfile);
    return userProfile as UserWithProfile;
  }

  async updateUserProfile(id: string, dto: UpdateUserProfileDto) {
    await this.checkUser(CheckUserValue.ID, id);

    const userProfile = await this.userRepository.updateUserProfile(id, dto);
    ExceptionUtil.default(userProfile);
    return userProfile as UserWithProfile;
  }

  async blockUser(id: string, reasonId: number) {
    await this.userRepository.blockUser(id, reasonId);
  }

  async getChatParticipants(dto: GetChatParticipantsDto) {
    const { userIds } = dto;
    const participants = await this.userRepository.getChatParticipants(userIds);
    if (!participants || participants.length < 2) {
      throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND);
    }
    return participants;
  }
}
