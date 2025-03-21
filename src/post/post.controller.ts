import { Controller, UseGuards, Req } from "@nestjs/common";
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from "@nestia/core";
import { ApiTags } from "@nestjs/swagger";
import { PostService } from "./post.service";
import { CreatePostDto } from "./dtos/create-post.dto";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { AuthGuard } from "../auth/guards/auth.guard";
import { AuthRequest } from "../types/request.type";
import { Permissions } from "../decorators/access-control.decorator";
import { Permission } from "../types/enum.type";
import { PaginationDto } from "../common/dtos/common.dto";

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

  /**
   * @summary 특정 게시글 조회
   * @param id 게시글 id
   * @returns 게시글
   * @throws 404 게시글을 찾을 수 없습니다.
   */
  @TypedRoute.Get(":id")
  async getPost(@TypedParam("id") id: number) {
    return this.postService.getPost(id);
  }

  /**
   * @summary 게시글 목록 조회
   * @param dto 페이지네이션 dto
   * @returns 게시글 목록
   */
  @TypedRoute.Get("list")
  async getPostList(@TypedQuery() dto: PaginationDto) {
    return this.postService.getPostList(dto);
  }
}
