import { User, UserEvent, UserPermission, UserProfile } from "@prisma/client";

export interface UserWithoutPassword extends Omit<User, "password"> {}

export interface UserDetail extends UserWithoutPassword {
  profile: UserProfile;
  permissions: UserPermission[];
  events: UserEvent[];
}
