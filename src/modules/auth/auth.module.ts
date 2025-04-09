import { Module, Global } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserRepository } from "../user/user.repository";
import { UserService } from "../user/user.service";
import { MailService } from "../mail/mail.service";
import { EncryptionService } from "@shared/utils/encryption.util";

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    { provide: "IUserService", useClass: UserService },
    AuthService,
    MailService,
    UserRepository,
    EncryptionService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
