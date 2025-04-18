import { OrderStatus } from "@dangol/core";
import { PaginationDto } from "@/modules/common/dtos/common.dto";

export interface GetOrderListDto extends PaginationDto {
  status?: OrderStatus;
}
