import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { MailService } from "@modules/mail/mail.service";
import { UserRepository } from "./user.repository";
import { EncryptionService } from "@shared/utils/encryption.util";

@Module({
  controllers: [UserController],
  providers: [
    EncryptionService,
    { provide: "IUserService", useClass: UserService },
    MailService,
    UserRepository,
  ],
})
export class UserModule {}
