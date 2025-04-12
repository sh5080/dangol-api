import { tags } from "typia";
import { SendMailType } from "@shared/types/enum.type";

export interface CreateUserDto {
  email: string & tags.Format<"email">;
  password: string & tags.MinLength<8> & tags.MaxLength<16>;
  name: string & tags.MinLength<2> & tags.MaxLength<10>;
  phoneNumber: string &
    tags.Pattern<"^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$"> &
    tags.MinLength<10> &
    tags.MaxLength<13> &
    tags.Example<"010-1234-5678">;
  isPersonalInfoCollectionAgree: boolean & tags.Example<true>;
  isPersonalInfoUseAgree: boolean & tags.Example<true>;
}

export interface CertificationDto {
  type: SendMailType;
  email: string & tags.Format<"email">;
}
