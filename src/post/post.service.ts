import { Injectable, NotFoundException } from "@nestjs/common";
import { PostRepository } from "./post.repository";
import { IPostService } from "../interfaces/post.interface";
import { CreatePostDto } from "./dtos/create-post.dto";
import { DefaultErrorMessage } from "../types/message.type";
import { PaginationDto } from "../common/dtos/common.dto";

@Injectable()
export class PostService implements IPostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(userId: string, dto: CreatePostDto) {
    return await this.postRepository.createPost(userId, dto);
  }

  async getPost(id: number) {
    const post = await this.postRepository.getPost(id);
    if (!post) {
      throw new NotFoundException(DefaultErrorMessage.SEARCH_NOT_FOUND);
    }
    return post;
  }

  async getPostList(dto: PaginationDto) {
    const postList = await this.postRepository.getPostList(dto);
    if (!postList.length) {
      throw new NotFoundException(DefaultErrorMessage.SEARCH_NOT_FOUND);
    }
    return postList;
  }
}
