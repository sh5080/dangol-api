import { LoginDto } from "./create-auth.dto";
import { tags } from "typia";

export interface UpdatePasswordDto extends LoginDto {
  password: string &
    tags.MinLength<8> &
    tags.MaxLength<16> &
    tags.Example<"test123123!">;
}
