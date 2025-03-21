import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreatePostDto } from "./dtos/create-post.dto";
import { postDetail } from "./queries/include.query";
import { PaginationDto } from "../common/dtos/common.dto";

@Injectable()
export class PostRepository {
  private readonly prisma: Prisma.TransactionClient;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prisma;
  }
  async createPost(userId: string, dto: CreatePostDto) {
    const { categoryIds, ...rest } = dto;
    return await this.prisma.post.create({
      data: {
        ...rest,
        authorId: userId,
        categories: {
          create:
            categoryIds?.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })) || [],
        },
      },
      include: { categories: true },
    });
  }

  async getPost(id: number) {
    return await this.prisma.post.findUnique({
      where: { id },
      include: postDetail,
    });
  }

  async getPostList(dto: PaginationDto) {
    const { page, pageSize } = dto;
    return await this.prisma.post.findMany({
      include: postDetail,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }
}
