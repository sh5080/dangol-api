import { PaginationDto } from "@/modules/common/dtos/common.dto";
import { OrderStatus } from "@prisma/client";

export interface GetOrderListDto extends PaginationDto {
  status?: OrderStatus;
}
