import { User, UserProfile, UserPermission, UserEvent } from "@prisma/client";

export interface UserWithProfile extends User {
  profile: UserProfile;
  events: UserEvent[];
  permissions: UserPermission[];
}
