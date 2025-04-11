import { Injectable } from "@nestjs/common";
import { PrismaClient, UserAgreementCategory } from "@prisma/client";
import { CreateUserDto } from "@modules/user/dtos/create-user.dto";

@Injectable()
export class PrismaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async ensureUser(
    dto: CreateUserDto,
    userId: string,
    authProviderId: number
  ): Promise<void> {
    const {
      // authType,
      isPersonalInfoCollectionAgree,
      isPersonalInfoUseAgree,
      ...user
    } = dto;

    const userExists = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!userExists) {
      await this.prisma.user.create({
        data: {
          id: userId,
          ...user,
          // authProviderId,
          agreements: {
            create: [
              {
                category: UserAgreementCategory.PERSONAL_INFO_COLLECTION,
                isAgreed: isPersonalInfoCollectionAgree,
              },
              {
                category: UserAgreementCategory.PERSONAL_INFO_USE,
                isAgreed: isPersonalInfoUseAgree,
              },
            ],
          },
        },
      });
      console.log(`User "${userId}" created successfully`);
    }
  }

  /** 인증 제공자 존재 확인 및 생성 */
  // async ensureAuthProvider(name: string): Promise<void> {
  //   const authProviderExists = await this.prisma.authProvider.findFirst({
  //     where: { name },
  //   });

  //   if (!authProviderExists) {
  //     await this.prisma.authProvider.create({ data: { name } });
  //     console.log(`AuthProvider "${name}" created successfully`);
  //   }
  // }

  async ensureBlockReason(description: string): Promise<void> {
    const blockReasonExists = await this.prisma.blockReason.findFirst({
      where: { description },
    });

    if (!blockReasonExists) {
      await this.prisma.blockReason.create({ data: { description } });
      console.log(`BlockReason "${description}" created successfully`);
    }
  }
}
