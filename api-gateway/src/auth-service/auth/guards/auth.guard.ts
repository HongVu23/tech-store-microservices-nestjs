import { CanActivate, ExecutionContext, HttpException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(@Inject('AUTH_SERVICE') private authServiceClient: ClientProxy) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedException();
        }

        const token = authHeader.split(' ')[1];

        // verify JWT
        try {
            const userInfo: any = await firstValueFrom(this.authServiceClient.send({ cmd: 'verify-jwt' }, token));

            // asign user info to req object
            req.user = userInfo;
            return true;
        } catch (err) {
            throw new HttpException(err.message, err.statusCode);
        }
    }
}