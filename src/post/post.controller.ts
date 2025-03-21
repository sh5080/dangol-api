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
import { UpdatePostDto } from "./dtos/update-post.dto";

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
  @Permissions(Permission.POST)
  async createPost(@Req() req: AuthRequest, @TypedBody() dto: CreatePostDto) {
    const userId = req.user.userId;
    return this.postService.createPost(userId, dto);
  }
  /**
   * @summary 게시글 목록 조회
   * @param dto 페이지네이션 dto
   * @returns 게시글 목록
   * @throws 404 검색 결과가 존재하지 않습니다.
   */
  @TypedRoute.Get("list")
  async getPostList(@TypedQuery() dto: PaginationDto) {
    return this.postService.getPostList(dto);
  }

  /**
   * @summary 특정 게시글 조회
   * @param id 게시글 id
   * @returns 게시글
   * @throws 404 검색 결과가 존재하지 않습니다.
   */
  @TypedRoute.Get(":id")
  async getPost(@TypedParam("id") id: number) {
    return this.postService.getPost(id);
  }

  /**
   * @summary 게시글 수정
   * @security bearer
   * @param id 게시글 id
   * @param dto 게시글 수정 dto
   * @returns 게시글
   * @throws 404 검색 결과가 존재하지 않습니다.
   * @throws 403 접근 권한이 없습니다.
   */
  @TypedRoute.Put(":id")
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(Permission.POST)
  async updatePost(
    @Req() req: AuthRequest,
    @TypedParam("id") id: number,
    @TypedBody() dto: UpdatePostDto
  ) {
    const userId = req.user.userId;
    return this.postService.updatePost(userId, id, dto);
  }

  /**
   * @summary 게시글 삭제
   * @security bearer
   * @param id 게시글 id
   * @returns 게시글
   * @throws 404 검색 결과가 존재하지 않습니다.
   * @throws 403 접근 권한이 없습니다.
   */
  @TypedRoute.Delete(":id")
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(Permission.POST)
  async deletePost(@Req() req: AuthRequest, @TypedParam("id") id: number) {
    const userId = req.user.userId;
    return this.postService.deletePost(userId, id);
  }
}
