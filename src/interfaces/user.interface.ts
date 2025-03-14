import { User } from "@prisma/client";
import { CreateUserDto, CertificationDto } from "../user/dtos/create-user.dto";
import { CheckUserValueType } from "../types/enum.type";
import {
  CheckCertificationDto,
  UpdatePasswordDto,
  UpdateUserProfileDto,
} from "../user/dtos/update-user.dto";
import { UserWithoutPassword } from "../auth/dtos/create-auth.dto";
import { UserWithProfile } from "../user/dtos/response.dto";

export interface IUserService {
  createUser(dto: CreateUserDto): Promise<UserWithoutPassword>;
  checkUser(key: CheckUserValueType, value: string): Promise<boolean>;
  getUserByEmail(email: string): Promise<User>;
  getUserProfileById(id: string): Promise<UserWithProfile>;
  updatePassword(id: string, dto: UpdatePasswordDto): Promise<void>;
  updateUserProfile(
    id: string,
    dto: UpdateUserProfileDto
  ): Promise<UserWithoutPassword>;
  sendCertification(dto: CertificationDto): Promise<void>;
  checkCertification(dto: CheckCertificationDto): Promise<void>;
}
