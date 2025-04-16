import { CreateUserDto } from "@modules/user/dtos/create-user.dto";
import { CheckUserValueType } from "@shared/types/enum.type";
import { User } from "@prisma/client";
import { UserWithoutPassword } from "@/modules/user/dtos/response.dto";
export interface IUserService {
  createUser(dto: CreateUserDto): Promise<UserWithoutPassword>;
  checkUser(key: CheckUserValueType, value: string): Promise<boolean>;
  existEmail(email: string): Promise<boolean>;
  getUserByEmail(email: string): Promise<User>;

  blockUser(id: string, reasonId: number): Promise<void>;
  // getChatParticipants(userIds: GetChatParticipantsDto): Promise<ChatUser[]>;
}
