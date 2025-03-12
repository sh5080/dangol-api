import { User } from "@prisma/client";
import { CreateUserDto, CertificationDto } from "../user/dtos/create-user.dto";
import { CheckUserValueType } from "../types/enum.type";
import {
  CheckCertificationDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from "../user/dtos/update-user.dto";
import { UserWithoutPassword } from "../auth/dtos/create-auth.dto";

export interface IUserService {
  createUser(dto: CreateUserDto): Promise<UserWithoutPassword>;
  checkUser(key: CheckUserValueType, value: string): Promise<boolean>;
  getUserByEmail(email: string): Promise<User>;
  updatePassword(id: string, dto: UpdatePasswordDto): Promise<void>;
  updateUser(id: string, dto: UpdateUserDto): Promise<UserWithoutPassword>;
  sendCertification(dto: CertificationDto): Promise<void>;
  checkCertification(dto: CheckCertificationDto): Promise<void>;
}
