import { Category, Post, User } from "@prisma/client";

export interface PostDetail extends Post {
  categories: { category: Category }[];
  author: Pick<User, "id" | "name">;
}
