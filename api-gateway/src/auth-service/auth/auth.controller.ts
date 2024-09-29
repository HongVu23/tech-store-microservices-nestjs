import { Body, Controller, Get, Patch, Post, Req, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dtos/login.dto";
import { Response, Request } from "express";
import { RegisterDto } from "./dtos/register.dto";
import { ChangePasswordDto } from "./dtos/change-password.dto";

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post()
    @UsePipes(ValidationPipe)
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {

        const respone = await this.authService.login(loginDto);

        // Create secure cookie with refresh token 
        res.cookie('jwt', respone.refreshToken, {
            // httpOnly: true, //accessible only by web server 
            secure: true, //https
            sameSite: 'none', //cross-site cookie 
            maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
        })

        // Send accessToken containing username and role 
        res.json({ accessToken: respone.accessToken });
    }

    @Post('register')
    @UsePipes(ValidationPipe)
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Get('refresh')
    refresh(@Req() req: Request) {
        const cookies: any = req.cookies;
        return this.authService.refresh(cookies);
    }

    @Post('logout')
    logout(@Req() req: Request, @Res() res: Response) {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204); //No content
        res.clearCookie('jwt', { /*httpOnly: true,*/ sameSite: 'none', secure: true });
        res.json({ message: 'Cookie cleared' });
    }

    @Patch('changePassword')
    changePassword(@Body() changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(changePasswordDto);
    }
}