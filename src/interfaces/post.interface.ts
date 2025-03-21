import { Post } from "@prisma/client";
import { CreatePostDto } from "../post/dtos/create-post.dto";
import { PostDetail } from "../post/dtos/response.dto";
import { PaginationDto } from "../common/dtos/common.dto";
import { UpdatePostDto } from "../post/dtos/update-post.dto";

export interface IPostService {
  createPost(userId: string, dto: CreatePostDto): Promise<Post>;
  getPost(id: number): Promise<PostDetail>;
  getPostList(dto: PaginationDto): Promise<PostDetail[]>;
  updatePost(userId: string, id: number, dto: UpdatePostDto): Promise<Post>;
}
