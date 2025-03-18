import { GetUserListDto } from "../user/dtos/get-user.dto";
import { UserWithoutPassword, UserDetail } from "../user/dtos/response.dto";
import { UpdateUserPermissionDto } from "../user/dtos/update-user.dto";

export interface IUserService {
  getUserList(dto: GetUserListDto): Promise<UserWithoutPassword[]>;
  getUserDetail(id: string): Promise<UserDetail>;
  updateUserPermission(dto: UpdateUserPermissionDto): Promise<void>;
}
