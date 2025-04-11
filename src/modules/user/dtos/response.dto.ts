import { User } from "@prisma/client";

export interface UserWithoutPassword extends Omit<User, "password"> {}

export interface ChatUser {
  restaurantName: string;
}
