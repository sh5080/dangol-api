import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UserRepository } from "./user.repository";
import { UserErrorMessage } from "@shared/types/message.type";
import { CheckUserValueType } from "@shared/types/enum.type";
import { IUserService } from "@shared/interfaces/user.interface";
import { GetChatParticipantsDto } from "./dtos/get-user.dto";
import { ExceptionUtil } from "@/shared/utils/exception.util";

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}
  async checkUser(key: CheckUserValueType, value: string) {
    const user = await this.userRepository.checkUserByValue(key, value);
    ExceptionUtil.default(user, UserErrorMessage.USER_NOT_FOUND, 403);
    return user;
  }

  async createUser(dto: CreateUserDto) {
    const { email } = dto;
    const isExist = await this.userRepository.getUserByEmail(email);
    ExceptionUtil.default(!isExist, UserErrorMessage.EMAIL_CONFLICTED, 409);

    return await this.userRepository.createUser(dto);
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.getUserByEmail(email);
    ExceptionUtil.default(user, UserErrorMessage.USER_NOT_FOUND);
    return user;
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
