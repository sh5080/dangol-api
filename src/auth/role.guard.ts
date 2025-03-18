import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthRequest } from "../types/request.type";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 메타데이터에서 허용된 역할 배열 가져오기
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler()
    );

    // 역할 제한이 없으면 접근 허용
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const userRole = request.user?.role;

    // 사용자 역할이 없고 'user'가 허용된 역할에 포함되면 접근 허용
    if (!userRole && requiredRoles.includes("user")) {
      return true;
    }

    // 사용자 역할이 허용된 역할 목록에 포함되면 접근 허용
    return !!userRole && requiredRoles.includes(userRole);
  }
}
