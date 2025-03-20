import { Controller, UseGuards, Req } from "@nestjs/common";
import { TypedBody, TypedRoute } from "@nestia/core";
import { ApiTags } from "@nestjs/swagger";
import { PostService } from "./post.service";
import { CreatePostDto } from "./dtos/create-post.dto";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { AuthGuard } from "../auth/guards/auth.guard";
import { AuthRequest } from "../types/request.type";
import { Permissions } from "../decorators/access-control.decorator";
import { Permission } from "../types/enum.type";

@ApiTags("게시글")
@Controller("post")
export class PostController {
  constructor(private readonly postService: PostService) {}
  /**
   * @summary 게시글 생성
   * @security bearer
   * @param dto 게시글 생성 dto
   * @returns 게시글
   * @throws 403 권한이 없습니다.
   * @throws 400 게시글 생성 실패
   */
  @TypedRoute.Post()
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(Permission.POST_CREATE)
  async createPost(@Req() req: AuthRequest, @TypedBody() dto: CreatePostDto) {
    const userId = req.user.userId;
    return this.postService.createPost(userId, dto);
  }
}
