import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { MailService } from "../mail/mail.service";
import { UserRepository } from "./user.repository";
import { EncryptionService } from "../utils/encryption.util";

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
