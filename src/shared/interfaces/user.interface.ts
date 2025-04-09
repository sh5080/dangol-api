import { CreateUserDto } from "@modules/user/dtos/create-user.dto";
import { CheckUserValueType } from "@shared/types/enum.type";
import { UpdateUserProfileDto } from "@modules/user/dtos/update-user.dto";
import { ChatUser, UserWithProfile } from "@modules/user/dtos/response.dto";
import {
  CheckNicknameDto,
  GetChatParticipantsDto,
} from "@modules/user/dtos/get-user.dto";
import { User } from "@prisma/client";
export interface IUserService {
  createUser(dto: CreateUserDto): Promise<User>;
  checkUser(key: CheckUserValueType, value: string): Promise<boolean>;
  checkNickname(dto: CheckNicknameDto): Promise<boolean>;
  getUserByEmail(email: string): Promise<User>;
  getUserProfileById(id: string): Promise<UserWithProfile>;
  updateUserProfile(
    id: string,
    dto: UpdateUserProfileDto
  ): Promise<UserWithProfile>;
  blockUser(id: string, reasonId: number): Promise<void>;
  getChatParticipants(userIds: GetChatParticipantsDto): Promise<ChatUser[]>;
}
