import { User } from "@prisma/client";
import { tags } from "typia";
import { AuthProviderType } from "../../types/enum.type";

interface EqualLoginDto {
  email: string & tags.Format<"email">;
  authType: AuthProviderType;
}

export interface LoginDto extends EqualLoginDto {
  password: string & tags.MinLength<8> & tags.MaxLength<16>;
}

export interface SocialLoginDto extends EqualLoginDto {}

export interface UserWithoutPassword extends Omit<User, "password"> {}
