import { User } from "@prisma/client";

export interface UserWithProfile extends User {
  // profile: UserProfile;
}

export interface ChatUser {
  restaurantName: string;
}
