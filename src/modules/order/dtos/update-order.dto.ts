import { DeliveryStatus, DeliveryType } from "@dangol/core";

export interface UpdateOrderDeliveryDto {
  status: DeliveryStatus;
  type: DeliveryType;
}
