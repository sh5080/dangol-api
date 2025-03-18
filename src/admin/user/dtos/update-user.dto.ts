import { tags } from "typia";

export interface UpdateUserPermissionDto {
  userId: string & tags.Format<"uuid">;
  permissionId: number;
}
