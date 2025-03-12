import { tags } from "typia";
import { Certification, CertificationType } from "../../types/enum.type";

export interface CreateUserDto {
  email: string & tags.Format<"email">;
  password: string & tags.MinLength<8> & tags.MaxLength<16>;
  name: string & tags.MinLength<2> & tags.MaxLength<10>;
  affiliation: string &
    tags.MinLength<2> &
    tags.MaxLength<10> &
    tags.Example<"00대학교">;
  phoneNumber: string &
    tags.Pattern<"^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$"> &
    tags.MinLength<10> &
    tags.MaxLength<13> &
    tags.Example<"010-1234-5678">;
  userClass: string &
    tags.MinLength<2> &
    tags.MaxLength<10> &
    tags.Example<"학생">;
  event: number & tags.Minimum<1> & tags.Maximum<10>;
  certificationCode: string &
    tags.Pattern<"^[0-9]{6}$"> &
    tags.MinLength<6> &
    tags.MaxLength<6> &
    tags.Example<"123456">;
}

export interface CertificationDto {
  type: CertificationType;
  email: string & tags.Format<"email">;
}
