import { Controller } from "@nestjs/common";
import { TypedRoute } from "@nestia/core";
import { ApiTags } from "@nestjs/swagger";
import { CommonService } from "./common.service";

@ApiTags("공통")
@Controller("common")
export class CommonController {
  constructor(private readonly commonService: CommonService) {}
  /**
   * @summary 공통 설정 조회
   * @returns 공통 설정
   */
  @TypedRoute.Get("settings")
  async getCommonSettings() {
    return this.commonService.getCommonSettings();
  }
}
