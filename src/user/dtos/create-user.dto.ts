import { tags } from "typia";
import { AuthProviderType, CertificationType } from "../../types/enum.type";

export interface CreateUserDto {
  email: string & tags.Format<"email">;
  name: string & tags.MinLength<2> & tags.MaxLength<10>;
  nickname: string & tags.MinLength<2> & tags.MaxLength<10>;
  phoneNumber: string &
    tags.Pattern<"^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$"> &
    tags.MinLength<10> &
    tags.MaxLength<13> &
    tags.Example<"010-1234-5678">;
  isEventAgree: boolean & tags.Example<true>;
  authType: AuthProviderType;
}

export interface CertificationDto {
  type: CertificationType;
  email: string & tags.Format<"email">;
}
