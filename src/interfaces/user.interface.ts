import { User } from "@prisma/client";
import { CreateUserDto } from "../user/dtos/create-user.dto";
import { CheckUserValueType } from "../types/enum.type";
import {
  CertificationDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from "../user/dtos/update-user.dto";

export interface IUserService {
  /**
   * 회원가입
   *
   */
  createUser(dto: CreateUserDto): Promise<User>;
  checkUser(key: CheckUserValueType, value: string): Promise<boolean>;
  getUserByEmail(email: string): Promise<User>;
  updatePassword(id: string, dto: UpdatePasswordDto): Promise<void>;
  updateUser(id: string, dto: UpdateUserDto): Promise<User>;
  sendCertification(dto: CertificationDto): Promise<void>;
}
