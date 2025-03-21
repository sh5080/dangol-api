import { PaginationDto } from "../../common/dtos/common.dto";
import { UserDetail } from "../user/dtos/response.dto";
import { UpdateUserPermissionDto } from "../user/dtos/update-user.dto";

export interface IUserService {
  getUserList(dto: PaginationDto): Promise<UserDetail[]>;
  getUserDetail(id: string): Promise<UserDetail>;
  updateUserPermission(dto: UpdateUserPermissionDto): Promise<void>;
}
