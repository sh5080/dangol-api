import { Module } from "@nestjs/common";
import { CommonController } from "./common.controller";
import { CommonRepository } from "./common.repository";
import { CommonService } from "./common.service";

@Module({
  controllers: [CommonController],
  providers: [CommonService, CommonRepository],
  exports: [],
})
export class CommonModule {}
