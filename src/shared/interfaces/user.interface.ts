import { CreateUserDto } from "@modules/user/dtos/create-user.dto";
import { CheckUserValueType } from "@shared/types/enum.type";
import { User } from "@prisma/client";
export interface IUserService {
  createUser(dto: CreateUserDto): Promise<User>;
  checkUser(key: CheckUserValueType, value: string): Promise<boolean>;

  getUserByEmail(email: string): Promise<User>;

  blockUser(id: string, reasonId: number): Promise<void>;
  // getChatParticipants(userIds: GetChatParticipantsDto): Promise<ChatUser[]>;
}
