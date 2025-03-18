import { GetUserListDto } from "../user/dtos/get-user.dto";
import { UserWithoutPassword } from "../user/dtos/response.dto";

export interface IUserService {
  getUserList(dto: GetUserListDto): Promise<UserWithoutPassword[]>;
}
