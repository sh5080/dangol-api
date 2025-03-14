import { User, UserProfile, UserEvent } from "@prisma/client";

export type UserWithProfile = User & {
  profile: UserProfile;
  events: UserEvent[];
};
