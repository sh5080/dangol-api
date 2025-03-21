import { tags } from "typia";

export interface CreatePostDto {
  title: string & tags.MinLength<1>;
  description?: string;
  content: string & tags.MinLength<1>;
  categoryIds?: number[];
  image?: string;
}
