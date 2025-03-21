import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { IUserService } from "../interfaces/user.interface";
import { UserErrorMessage } from "../../types/message.type";
import { UserDetail } from "./dtos/response.dto";
import { UpdateUserPermissionDto } from "./dtos/update-user.dto";
import { PaginationDto } from "../../common/dtos/common.dto";
@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserList(dto: PaginationDto) {
    const userList = await this.userRepository.getUserList(dto);
    if (!userList) {
      throw new ForbiddenException(UserErrorMessage.USER_NOT_FOUND);
    }
    return userList as UserDetail[];
  }

  async getUserDetail(id: string) {
    const userDetail = await this.userRepository.getUserDetail(id);
    if (!userDetail) {
      throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND);
    }
    delete (userDetail as any).password;
    return userDetail as UserDetail;
  }

  async updateUserPermission(dto: UpdateUserPermissionDto) {
    const userPermissions = await this.userRepository.getUserPermissions(
      dto.userId
    );
    // 권한이 없으면 생성
    if (!userPermissions.length) {
      await this.userRepository.createUserPermission(dto);
      return;
    }
    // 권한이 있으면 삭제
    if (
      userPermissions.map((permission) => permission.id === dto.permissionId)
    ) {
      await this.userRepository.deleteUserPermission(dto);
      return;
    }
  }
}
