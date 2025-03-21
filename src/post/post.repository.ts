import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreatePostDto } from "./dtos/create-post.dto";
import { postDetail } from "./queries/include.query";
import { PaginationDto } from "../common/dtos/common.dto";
import { UpdatePostDto } from "./dtos/update-post.dto";

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

  async updatePost(id: number, dto: UpdatePostDto) {
    const { categoryIds, ...rest } = dto;

    return await this.prismaService.prisma.$transaction(async (tx) => {
      // 1. 기존 카테고리 연결 모두 삭제
      await tx.postCategory.deleteMany({ where: { postId: id } });

      // 2. 새 카테고리 연결 생성
      return await tx.post.update({
        where: { id },
        data: {
          ...rest,
          categories: {
            create:
              categoryIds?.map((categoryId) => ({
                category: { connect: { id: categoryId } },
              })) || [],
          },
        },
        include: { categories: true },
      });
    });
  }

  async deletePost(id: number) {
    return await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
