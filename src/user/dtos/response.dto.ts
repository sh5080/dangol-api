import { User, UserProfile, UserRole } from "@prisma/client";

export interface UserWithoutPassword extends Omit<User, "password"> {}

export interface UserWithProfile extends UserWithoutPassword {
  profile: UserProfile;
}

export interface UserWithRole extends User {
  role: UserRole;
}
