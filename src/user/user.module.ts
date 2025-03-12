import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { MailService } from "../mail/mail.service";
import { UploadService } from "../upload/upload.service";
import { UserRepository } from "./user.repository";
import { AuthService } from "../auth/auth.service";
import { EncryptionService } from "../utils/encryption.util";

@Module({
  controllers: [UserController],
  providers: [
    AuthService,
    EncryptionService,
    { provide: "IUserService", useClass: UserService },
    MailService,
    UploadService,
    UserRepository,
  ],
})
export class UserModule {}
