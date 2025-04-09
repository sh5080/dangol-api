import {
  User,
  UserProfile,
  UserRole,
  UserPermission,
  UserEvent,
} from "@prisma/client";

export interface UserWithoutPassword extends Omit<User, "password"> {}

export interface UserWithProfile extends UserWithoutPassword {
  profile: UserProfile;
  events: UserEvent[];
  permissions: UserPermission[];
}

export interface UserWithRole extends User {
  role: UserRole;
}
