import { Controller } from "@nestjs/common";
import { TypedRoute } from "@nestia/core";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("앱")
@Controller("app")
export class AppController {
  /**
   * 서버 정상작동 여부 헬스체크
   * @summary 헬스체크
   * @returns Success message
   */
  @TypedRoute.Get("health")
  getHello(): string {
    return "Hello World";
  }
}
