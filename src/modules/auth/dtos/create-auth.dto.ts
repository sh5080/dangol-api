import { tags } from "typia";
// import { AuthProviderType } from "@shared/types/enum.type";

interface BaseLoginDto {
  email: string & tags.Format<"email">;
  // authType: AuthProviderType;
}

export interface LoginDto extends BaseLoginDto {
  password: string &
    tags.MinLength<8> &
    tags.MaxLength<16> &
    tags.Example<"test123123!">;
}
