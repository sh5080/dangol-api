import { Injectable } from "@nestjs/common";
import { PostRepository } from "./post.repository";
import { IPostService } from "../interfaces/post.interface";
import { CreatePostDto } from "./dtos/create-post.dto";

@Injectable()
export class PostService implements IPostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(userId: string, dto: CreatePostDto) {
    return await this.postRepository.createPost(userId, dto);
  }
}
