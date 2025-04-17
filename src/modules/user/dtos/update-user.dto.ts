import { tags } from "typia";
import { CertificationDto } from "./create-user.dto";

export interface UpdateUserProfileDto {
  nickname?: string & tags.MinLength<2> & tags.MaxLength<10>;
  image?: string;
}
export interface UpdatePasswordDto extends CertificationDto {
  code: string;
  password: string;
}
