import { Category, Permission } from "@prisma/client";

export interface Settings {
  permissions: Permission[];
  categories: Category[];
}
