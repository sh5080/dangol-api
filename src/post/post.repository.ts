import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreatePostDto } from "./dtos/create-post.dto";

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
}
