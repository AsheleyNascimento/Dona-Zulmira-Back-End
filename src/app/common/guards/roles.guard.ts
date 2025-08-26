import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // Se não tiver roles definidas, permite acesso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('User no guard:', request.user);

    if (
      !user ||
      (!requiredRoles.includes('*') && !requiredRoles.includes(user.funcao))
    ) {
      throw new ForbiddenException('Acesso restrito');
    }

    return true;
  }
}
