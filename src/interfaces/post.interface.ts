import { Post } from "@prisma/client";
import { CreatePostDto } from "../post/dtos/create-post.dto";

export interface IPostService {
  createPost(userId: string, dto: CreatePostDto): Promise<Post>;
}
