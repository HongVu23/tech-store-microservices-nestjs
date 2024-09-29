import { HttpException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { LoginDto } from "./dtos/login.dto";
import { firstValueFrom } from "rxjs";
import { RegisterDto } from "./dtos/register.dto";
import { ChangePasswordDto } from "./dtos/change-password.dto";

@Injectable()
export class AuthService {

    constructor(@Inject('AUTH_SERVICE') private authServiceClient: ClientProxy) {}

    async login(loginDto: LoginDto) {
        let respone: Record<string, string>;
        
        try {
            respone = await firstValueFrom(this.authServiceClient.send({ cmd: 'login' }, loginDto));
        } catch (err: any) {
            throw new HttpException(err.message, err.statusCode);
        }

        return respone;
    }

    async register(registerDto: RegisterDto) {
        
        try {
            const respone = await firstValueFrom(this.authServiceClient.send({ cmd: 'register' }, registerDto));
            return respone;
        } catch (err: any) {
            throw new HttpException(err.message, err.statusCode);
        }
    }

    async refresh(cookies: any) {

        if (!cookies?.jwt) throw new UnauthorizedException();

        try {
            const respone = await firstValueFrom(this.authServiceClient.send({ cmd: 'refresh' }, cookies.jwt));
            return respone;
        } catch (err) {
            throw new HttpException(err.message, err.statusCode);
        }
    }

    async changePassword(changePasswordDto: ChangePasswordDto) {

        try {
            const respone = await firstValueFrom(this.authServiceClient.send({ cmd: 'change-password' }, changePasswordDto));
            return respone;
        } catch (err) {
            throw new HttpException(err.message, err.statusCode);
        }
    }
}