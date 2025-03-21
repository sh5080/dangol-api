import { Post } from "@prisma/client";
import { CreatePostDto } from "../post/dtos/create-post.dto";
import { PostDetail } from "../post/dtos/response.dto";
import { PaginationDto } from "../common/dtos/common.dto";

export interface IPostService {
  createPost(userId: string, dto: CreatePostDto): Promise<Post>;
  getPost(id: number): Promise<PostDetail>;
  getPostList(dto: PaginationDto): Promise<PostDetail[]>;
}
