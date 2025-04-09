import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthRequest } from "@shared/types/request.type";
import { DefaultErrorMessage } from "@shared/types/message.type";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler()
    );

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const userRole = request.user?.role;
    if (userRole && !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(DefaultErrorMessage.FORBIDDEN);
    }
    // 사용자 역할이 허용된 역할 목록에 포함되면 접근 허용
    return !!userRole && requiredRoles.includes(userRole);
  }
}
