import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { LoginDto } from "./dtos/login.dto";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { ConfigService } from '@nestjs/config';
import * as brcypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from "./dtos/register.dto";
import { ChangePasswordDto } from "./dtos/change-password.dto";

@Injectable()
export class AuthService {

    constructor(@Inject('USER_SERVICE') private userServiceClient: ClientProxy, private configService: ConfigService) { }

    async login(loginDto: LoginDto): Promise<{ accessToken: string, refreshToken: string }> {

        const { email, password } = loginDto;
        let user: any;

        try {
            user = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user-by-email' }, email));
        } catch (err) {

            if (err.statusCode === HttpStatus.NOT_FOUND) {
                throw new RpcException({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED });
            }
            throw new RpcException(err);
        }

        const match: boolean = await brcypt.compare(password, user.password);

        if (!match) throw new RpcException({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED })

        // check whether user is enable or not
        if (!user.status) throw new RpcException({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED })

        // generate jwt token
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    avatar: user.avatar.imageUrl
                }

            },
            this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            { expiresIn: user.role === 'Admin' ? '1d' : '15m' }
        )

        const refreshToken = jwt.sign(
            { "username": user.username },
            this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            { expiresIn: '7d' }
        )

        return { accessToken, refreshToken };
    }

    async register(registerDto: RegisterDto): Promise<{ message: string }> {
        try {
            await firstValueFrom(this.userServiceClient.send({ cmd: 'create-user' }, registerDto));
            return { message: 'Register success' };
        } catch (err) {
            throw new RpcException(err);
        }
    }

    async refresh(refreshToken: string): Promise<any> {

        let decoded: any;

        try {
            decoded = await new Promise<any>((resolve, reject) => {
                jwt.verify(
                    refreshToken,
                    this.configService.get<string>('REFRESH_TOKEN_SECRET'),
                    (err, decoded) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(decoded);
                        }
                    }
                );
            });
        } catch (err) {
            if (err) throw new RpcException({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
        }

        let foundUser: any;
        try {
            foundUser = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user-by-name' }, decoded.username));
        } catch (err) {
            throw new RpcException(err);
        }

        if (!foundUser) throw new RpcException({ message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED });

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    id: foundUser._id,
                    username: foundUser.username,
                    role: foundUser.role,
                    avatar: foundUser.avatar.imageUrl
                }
            },
            this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            { expiresIn: foundUser.role === 'Admin' ? '1d' : '15m' }
        )

        return { accessToken };
    }

    async changePassword(changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {

        let foundUser: any;
        try {
            foundUser = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user-by-email' }, changePasswordDto.email));
        } catch (err) {
            throw new RpcException(err);
        }

        const match: boolean = await brcypt.compare(changePasswordDto.oldPassword, foundUser.password);

        if (!match) {
            throw new RpcException({ message: 'The old password is incorrect. Please try again.', statusCode: HttpStatus.UNAUTHORIZED });
        }

        // asign new password to foundUser object
        foundUser.password = changePasswordDto.newPassword;

        try {
            await firstValueFrom(
                this.userServiceClient.send({ cmd: 'change-password' },
                    { email: changePasswordDto.email, newPassword: changePasswordDto.newPassword })
            );
        } catch (err) {
            throw new RpcException(err);
        }

        return { message: 'Password updated' };
    }

    async verifyJWT(token: any): Promise<any> {

        let decoded: any;

        try {
            decoded = await new Promise<any>((resolve, reject) => {
                jwt.verify(
                    token,
                    this.configService.get<string>('ACCESS_TOKEN_SECRET'),
                    (err: any, decoded: any) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(decoded);
                        }
                    }
                );
            });
        } catch (err) {
            if (err) throw new RpcException({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
        }

        // asign user infro to request object
        const user = {
            id: decoded.UserInfo.id,
            username: decoded.UserInfo.username,
            role: decoded.UserInfo.role
        }

        return user;
    }

    async getTokens(user: any): Promise<{ accessToken: string, refreshToken: string }> {
        // generate jwt token
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                    avatar: user.avatar.imageUrl
                }

            },
            this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            { expiresIn: user.role === 'Admin' ? '1d' : '15m' }
        )

        const refreshToken = jwt.sign(
            { "username": user.username },
            this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            { expiresIn: '7d' }
        )

        return { accessToken, refreshToken };
    }
}