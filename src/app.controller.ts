import { Controller, Get } from "@nestjs/common";
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
  /**
   * ngrok 터널 목록 조회
   */
  @Get("tunnels")
  async getTunnels() {
    const ngrokResponse = await fetch(
      `http://host.docker.internal:4040/api/tunnels`
    );

    const data = await ngrokResponse.json();

    return data.tunnels.map((tunnel: any) => ({
      name: tunnel.name,
      url: tunnel.public_url,
    }));
  }
}
