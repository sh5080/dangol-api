import {
  CertificationDto,
  CreateUserDto,
} from "@modules/user/dtos/create-user.dto";
import { CheckUserValueType } from "@shared/types/enum.type";
import { User } from "@prisma/client";
import { UserWithoutPassword } from "@/modules/user/dtos/response.dto";
import { FindEmailDto } from "@modules/user/dtos/get-user.dto";
import { UpdatePasswordDto } from "@/modules/user/dtos/update-user.dto";
export interface IUserService {
  createUser(dto: CreateUserDto): Promise<UserWithoutPassword>;
  checkUser(key: CheckUserValueType, value: string): Promise<boolean>;
  existEmail(email: string): Promise<boolean>;
  getUserByEmail(email: string): Promise<User>;
  findEmail(dto: FindEmailDto): Promise<{ email: string }>;
  updatePasswordCertification(dto: CertificationDto): Promise<void>;
  updatePassword(dto: UpdatePasswordDto): Promise<void>;
  blockUser(id: string, reasonId: number): Promise<void>;
  // getChatParticipants(userIds: GetChatParticipantsDto): Promise<ChatUser[]>;
}
