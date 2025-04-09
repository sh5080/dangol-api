import { tags } from "typia";

export interface PaginationDto {
  page: number & tags.Minimum<1>;
  pageSize: number & tags.Minimum<1>;
}
