import { CreateUserDto, CertificationDto } from "../user/dtos/create-user.dto";
import { CheckUserValueType } from "../types/enum.type";
import {
  CheckCertificationDto,
  UpdatePasswordDto,
  UpdateUserProfileDto,
} from "../user/dtos/update-user.dto";
import { UserWithProfile } from "../user/dtos/response.dto";
import { CheckNicknameDto } from "../user/dtos/get-user.dto";
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
  sendCertification(dto: CertificationDto): Promise<void>;
  checkCertification(dto: CheckCertificationDto): Promise<void>;
}
