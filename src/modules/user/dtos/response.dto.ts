import { User } from "@dangol/core";

export interface UserWithoutPassword extends Omit<User, "password"> {}

export interface ChatUser {
  restaurantName: string;
}
