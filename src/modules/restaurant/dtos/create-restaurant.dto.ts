import { RequestStatus } from "@prisma/client";
import { tags } from "typia";

export interface RequestRestaurantDto {
  name: string & tags.MinLength<2> & tags.MaxLength<10>;
  description?: string;
  businessLicenseImageUrl: string;
  businessLicenseNumber: string;
  address: string & tags.MinLength<2> & tags.MaxLength<10>;
  phoneNumber: string &
    tags.Pattern<"^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$"> &
    tags.MinLength<10> &
    tags.MaxLength<13> &
    tags.Example<"010-1234-5678">;
}

export interface ProcessRestaurantRequestDto {
  status: RequestStatus;
  rejectReason?: string;
}
