import { Body, Controller, Get, Post, Patch, UsePipes, ValidationPipe, Param, Req, Res, UseGuards, Query, Delete } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { Response } from "express";
import { AuthGuard } from "src/auth-service/auth/guards/auth.guard";
import { RolesGuard } from "src/auth-service/auth/guards/roles.guard";
import { Role } from "src/decorators/role.decorator";

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {

    constructor(private usersService: UsersService) { }

    @Get()
    @Role('Admin')
    getUsers() {
        return this.usersService.getUsers();
    }

    @Post()
    @Role('Admin')
    @UsePipes(ValidationPipe)
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.usersService.createUser(createUserDto);
    }

    @Get('search')
    @Role('Admin')
    searchUser(@Query('text') text?: string) {
        return this.usersService.searchUser(text);
    }

    @Patch(':userId')
    @UsePipes(ValidationPipe)
    async updateUser(@Req() req: any, @Res({ passthrough: true }) res: Response, @Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
        const respone = await this.usersService.updateUser(req.user, userId, updateUserDto);

        if (req.user.role === 'User') {
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

        return respone;
    }

    @Delete(':userId')
    @Role('Admin')
    deleteUser(@Param('userId') userId: string) {
        return this.usersService.deleteUser(userId);
    }

    @Get(':userId')
    @UsePipes(ValidationPipe)
    getUser(@Param('userId') userId: string) {
        return this.usersService.getUser(userId);
    }
}