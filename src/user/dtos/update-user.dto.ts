import { tags } from "typia";
import { CertificationType } from "../../types/enum.type";

export interface UpdatePasswordDto {
  email: string & tags.Format<"email">;
  currentPassword: string & tags.MinLength<8> & tags.MaxLength<16>;
  newPassword: string & tags.MinLength<8> & tags.MaxLength<16>;
  certificationCode: string &
    tags.MinLength<6> &
    tags.MaxLength<6> &
    tags.Example<"123456">;
}

export interface CheckCertificationDto {
  type: CertificationType;
  email: string & tags.Format<"email">;
  code: string & tags.MinLength<6> & tags.MaxLength<6> & tags.Example<"123456">;
}

export interface UpdateUserProfileDto {
  nickname: string & tags.MinLength<2> & tags.MaxLength<10>;
  interests?: string & tags.MinLength<2> & tags.MaxLength<40>;
  affiliation?: string &
    tags.MinLength<2> &
    tags.MaxLength<40> &
    tags.Example<"00대학교">;
  introduction?: string & tags.MinLength<2> & tags.MaxLength<40>;
  image: string;
}
