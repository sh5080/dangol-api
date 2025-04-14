import { DeliveryType } from "@prisma/client";

export interface ProcessOrderDto {
  deliveryType: DeliveryType; // SELF | DELIVERY | PICKUP
  estimatedTime?: number; // 예상 소요 시간 (분)
}
