import { tags } from "typia";

export interface UpdateUserProfileDto {
  nickname?: string & tags.MinLength<2> & tags.MaxLength<10>;
  image?: string;
}
