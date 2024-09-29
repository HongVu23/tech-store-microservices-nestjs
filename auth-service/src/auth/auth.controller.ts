import { Controller, UseFilters } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LoginDto } from "./dtos/login.dto";
import { AllExceptionsFilter } from "src/filters/all-exceptions.filter";
import { RegisterDto } from "./dtos/register.dto";
import { ChangePasswordDto } from "./dtos/change-password.dto";

@Controller()
@UseFilters(AllExceptionsFilter)
export class AuthController {

    constructor(private authService: AuthService) {}

    @MessagePattern({ cmd: 'login' })
    login(@Payload() loginDto: LoginDto): Promise<{ accessToken: string, refreshToken: string }> {
        return this.authService.login(loginDto);
    }

    @MessagePattern({ cmd: 'register' })
    register(@Payload() registerDto: RegisterDto): Promise<{ message: string }> {
        return this.authService.register(registerDto);
    }

    @MessagePattern({ cmd: 'refresh' })
    async refresh(@Payload() refreshToken: string): Promise<string> {
        return this.authService.refresh(refreshToken);
    }

    @MessagePattern({ cmd: 'change-password' })
    async changePassword(@Payload() changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
        return this.authService.changePassword(changePasswordDto);
    }

    @MessagePattern({ cmd: 'verify-jwt' })
    verifyJwt(@Payload() token: any): Promise<any> {
        return this.authService.verifyJWT(token);
    }

    @MessagePattern({ cmd: 'get-tokens' })
    async getTokens(@Payload() user: any): Promise<{ accessToken: string, refreshToken: string }> {
        return this.authService.getTokens(user);
    }
}