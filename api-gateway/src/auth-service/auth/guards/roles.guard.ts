import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from 'src/decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

        const role: string = this.reflector.get(Role, context.getHandler());

        if (!role) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        return this.matchRole(role, user.role);
    }

    matchRole(role: string, userRole: string): boolean {

        if (role === userRole) {
            return true;
        }

        return false;
    }
}
