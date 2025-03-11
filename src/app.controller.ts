import { Controller } from "@nestjs/common";
import { TypedRoute } from "@nestia/core";

@Controller("api")
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
