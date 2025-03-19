import { TypedBody, TypedParam, TypedQuery, TypedRoute } from "@nestia/core";
import { Controller, UseGuards, Req, Inject } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { Roles } from "../../decorators/access-control.decorator";
import { GetUserListDto } from "./dtos/get-user.dto";
import { IUserService } from "../interfaces/user.interface";
import { RoleGuard } from "../../auth/guards/role.guard";
import { Role } from "@prisma/client";
import { UpdateUserPermissionDto } from "./dtos/update-user.dto";

@ApiTags("어드민")
@Controller("admin/user")
export class UserController {
  constructor(
    @Inject("IUserService") private readonly userService: IUserService
  ) {}
  /**
   * @summary 유저 목록 조회
   * @security bearer
   * @returns 유저 목록
   * @throws 403 조회된 유저가 없습니다. (정상 작동이면 가능하지 않음)
   * @throws 403 권한이 없습니다.
   * @throws 404 유저 프로필 없음 (회원가입시 프로필 동시에 생성해서 사실상 이 오류가 나올 일은 없습니다.)
   */
  @TypedRoute.Get("list")
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getUserList(@TypedQuery() dto: GetUserListDto) {
    return this.userService.getUserList(dto);
  }
  /**
   * @summary 유저 상세 조회
   * @security bearer
   * @throws 403 권한이 없습니다.
   * @returns 유저 상세
   */
  @TypedRoute.Get(":id")
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async getUserDetail(@TypedParam("id") id: string) {
    return this.userService.getUserDetail(id);
  }
  /**
   * @summary 유저 권한 업데이트
   * @security bearer
   * @throws 403 권한이 없습니다.
   * @returns 유저 권한 업데이트
   */
  @TypedRoute.Put("permission")
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async updateUserPermission(@TypedBody() dto: UpdateUserPermissionDto) {
    return this.userService.updateUserPermission(dto);
  }
}
