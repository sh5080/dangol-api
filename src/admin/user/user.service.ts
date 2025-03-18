import { Injectable, ForbiddenException } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { GetUserListDto } from "./dtos/get-user.dto";
import { IUserService } from "../interfaces/user.interface";
import { UserErrorMessage } from "../../types/message.type";

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserList(dto: GetUserListDto) {
    const userList = await this.userRepository.getUserList(dto);
    if (!userList) {
      throw new ForbiddenException(UserErrorMessage.USER_NOT_FOUND);
    }
    return userList;
  }
}
