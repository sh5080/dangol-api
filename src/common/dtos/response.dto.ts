import { Permission } from "@prisma/client";

export interface Settings {
  permissions: Permission[];
}
