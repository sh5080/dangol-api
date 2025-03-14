import { tags } from "typia";
import { AuthProviderType, CertificationType } from "../../types/enum.type";

export interface CreateUserDto {
  email: string & tags.Format<"email">;
  password?: string &
    tags.MinLength<8> &
    tags.MaxLength<16> &
    tags.Example<"test123123!">;
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
  class: string & tags.MinLength<2> & tags.MaxLength<10> & tags.Example<"학생">;
  isEventAgree: boolean & tags.Example<true>;
  certificationCode: string &
    tags.Pattern<"^[0-9]{6}$"> &
    tags.MinLength<6> &
    tags.MaxLength<6> &
    tags.Example<"123456">;
  authType: AuthProviderType;
}

export interface CertificationDto {
  type: CertificationType;
  email: string & tags.Format<"email">;
}
