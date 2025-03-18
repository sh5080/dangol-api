import { User, UserProfile } from "@prisma/client";

export interface UserWithoutPassword extends Omit<User, "password"> {}

export interface UserWithProfile extends UserWithoutPassword {
  profile: UserProfile;
}
