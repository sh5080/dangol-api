import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { Role } from "@prisma/client";
import { UserErrorMessage } from "../../types/message.type";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      "permissions",
      context.getHandler()
    );
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException("인증이 필요합니다.");
    }
    // 어드민일 경우 권한 조회 패스
    if (user.role === Role.ADMIN) {
      return true;
    }
    // 사용자의 권한 조회
    const userPermissions =
      await this.prismaService.prisma.userPermission.findMany({
        where: { userId: user.userId },
        include: { permission: true },
      });

    // 필요한 권한이 있는지 확인
    const hasPermission = userPermissions.some((up) =>
      requiredPermissions.includes(up.permission.name)
    );

    if (!hasPermission) {
      throw new ForbiddenException(UserErrorMessage.PERMISSION_NOT_FOUND);
    }

    return true;
  }
}
