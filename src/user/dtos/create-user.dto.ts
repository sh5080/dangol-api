import { tags } from "typia";

export interface CreateUserDto {
  email: string & tags.Format<"email">;
  password: string & tags.MinLength<8> & tags.MaxLength<16>;
  name: string & tags.MinLength<2> & tags.MaxLength<10>;
  affiliation: string & tags.MinLength<2> & tags.MaxLength<10>;
  phoneNumber: string & tags.MinLength<12> & tags.MaxLength<15>;
  userClass: string & tags.MinLength<2> & tags.MaxLength<10>;
  event: number & tags.Minimum<1> & tags.Maximum<10>;
}
