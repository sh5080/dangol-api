import { Controller } from "@nestjs/common";
import { TypedRoute } from "@nestia/core";
import { ApiTags } from "@nestjs/swagger";
import { CommonService } from "./common.service";

@ApiTags("공통")
@Controller("common")
export class CommonController {
  constructor(private readonly commonService: CommonService) {}
}
