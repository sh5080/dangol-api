import { tags } from "typia";
import { CertificationType } from "../../types/enum.type";

export interface UpdateUserDto {
  name?: string & tags.MinLength<2> & tags.MaxLength<10>;
  subject?: string & tags.MinLength<2> & tags.MaxLength<10>;
  affiliation?: string & tags.MinLength<2> & tags.MaxLength<10>;
  description?: string & tags.MinLength<2> & tags.MaxLength<10>;
  thumbnail?: File;
}

export interface UpdatePasswordDto {
  password: string & tags.MinLength<8> & tags.MaxLength<16>;
}

export interface CertificationDto {
  type: CertificationType;
  email: string & tags.Format<"email">;
}
