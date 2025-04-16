import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UserRepository } from "./user.repository";
import { UserErrorMessage } from "@shared/types/message.type";
import { CheckUserValueType } from "@shared/types/enum.type";
import { IUserService } from "@shared/interfaces/user.interface";
import { ExceptionUtil } from "@/shared/utils/exception.util";
import * as bcrypt from "bcrypt";
import { UserWithoutPassword } from "./dtos/response.dto";

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}
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
