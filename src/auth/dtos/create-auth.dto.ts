import { User } from "@prisma/client";
import { tags } from "typia";

export interface LoginDto {
  email: string & tags.Format<"email">;
  password: string & tags.MinLength<8> & tags.MaxLength<16>;
}

export interface SocialLoginDto {
  email: string & tags.Format<"email">;
}

export interface UserWithoutPassword extends Omit<User, "password"> {}
