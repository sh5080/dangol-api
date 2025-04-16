import { Inject, Controller } from "@nestjs/common";
import { IUserService } from "@shared/interfaces/user.interface";
import { CreateUserDto } from "./dtos/create-user.dto";
import { ApiTags } from "@nestjs/swagger";
import { TypedBody, TypedRoute } from "@nestia/core";
import { CheckEmailDto } from "./dtos/get-user.dto";

@ApiTags("유저")
@Controller("user")
export class UserController {
  constructor(
    @Inject("IUserService") private readonly userService: IUserService
  ) {}

  /**
   * @summary 회원가입
   * @param dto 유저 생성 dto
   * @returns 생성된 유저
   * @throws 400 개인정보 수집에 동의해주세요.
   * @throws 409 이메일 중복
   */
  @TypedRoute.Post("signup")
  async signup(@TypedBody() dto: CreateUserDto) {
    return await this.userService.createUser(dto);
  }
  /**
   * @summary 이메일 중복확인
   * @param dto 유저 생성 dto
   * @returns status 200
   * @throws 409 이메일 중복
   */
  @TypedRoute.Post("check/email")
  async checkEmail(@TypedBody() dto: CheckEmailDto) {
    return await this.userService.existEmail(dto.email);
  }

  // 기존에는 userIds를 받아서 조회했는데, 유저에 해당하는 매장이 많을 수 있음. 설계가 잘못됨.
  // /**
  //  * @summary 채팅 참여자 조회
  //  * @security bearer
  //  * @param dto 채팅 참여자 조회 dto
  //  * @returns 채팅 참여자 정보
  //  * @throws 404 채팅 참여자 없음
  //  */
  // @TypedRoute.Post("chat/participants")
  // @UseGuards(AuthGuard)
  // async getChatParticipants(@TypedBody() dto: GetChatParticipantsDto) {
  //   return await this.userService.getChatParticipants(dto);
  // }
}
