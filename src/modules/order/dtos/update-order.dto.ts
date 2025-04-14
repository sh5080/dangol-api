import { DeliveryStatus, DeliveryType } from "@prisma/client";

export interface UpdateOrderDeliveryDto {
  status: DeliveryStatus;
  type: DeliveryType;
}
