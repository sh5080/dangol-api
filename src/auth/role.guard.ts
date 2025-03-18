import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthRequest } from "../types/request.type";

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

    // 사용자 역할이 허용된 역할 목록에 포함되면 접근 허용
    return !!userRole && requiredRoles.includes(userRole);
  }
}
