import { Controller, UseFilters } from "@nestjs/common";
import { UsersService } from "./users.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateUserDto } from "./dtos/create-user.dto";
import { AllExceptionsFilter } from "src/filters/all-exceptions.filter";
import { ParseObjectIdPipe } from "src/pipes/parse-objectid.pipe";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { ParseUserPipe } from "./pipes/parse-user.pipe";
import { User } from "./schemas/user.schema";
import { Document, Types } from "mongoose";
import { User as IUser } from "../interfaces/user.interface";

@Controller()
@UseFilters(AllExceptionsFilter)
export class UsersController {

    constructor(private usersService: UsersService) { }

    @MessagePattern({ cmd: 'get-users' })
    getUsers(): Promise<User[]> {
        return this.usersService.getUsers()
    }

    @MessagePattern({ cmd: 'create-user' })
    createUser(@Payload() createUserDto: CreateUserDto): Promise<{ message: string }> {
        return this.usersService.createUser(createUserDto);
    }

    @MessagePattern({ cmd: 'search-user' })
    searchUser(@Payload() text: string): Promise<User[]> {
        return this.usersService.searchUser(text);
    }

    @MessagePattern({ cmd: 'update-user' })
    updateUser(
        @Payload('user') loginUser: IUser,
        @Payload('userId', ParseObjectIdPipe, ParseUserPipe) user: Document<Types.ObjectId, any, User>,
        @Payload('updateUserDto') updateUserDto: UpdateUserDto): Promise<{ message: string }> {

        return this.usersService.updateUser(loginUser, user, updateUserDto);
    }

    @MessagePattern({ cmd: 'delete-user' })
    deleteUser(@Payload(ParseObjectIdPipe, ParseUserPipe) user: Document<Types.ObjectId, any, User>): Promise<{ message: string }> {
        return this.usersService.deleteUser(user);
    }

    @MessagePattern({ cmd: 'get-user' })
    getUser(@Payload(ParseObjectIdPipe, ParseUserPipe) user: Document<Types.ObjectId, any, User>) {
        return this.usersService.getUser(user);
    }

    @MessagePattern({ cmd: 'get-user-by-name' })
    getUserByName(@Payload() username: string): Promise<User> {
        return this.usersService.getUserByName(username);
    }

    @MessagePattern({ cmd: 'get-user-by-email' })
    getUserByEmail(@Payload() email: string): Promise<User> {
        return this.usersService.getUserByEmail(email);
    }

    @MessagePattern({ cmd: 'get-user-quantity-statistics' })
    getUserQuantityStatistics(): Promise<Record<string, number>> {
        return this.usersService.getUserQuantityStatistics();
    }

    @MessagePattern({ cmd: 'change-password' })
    changePassword(
        @Payload('email') email: string,
        @Payload('newPassword') newPassword: string): Promise<{ message: string }> {

        return this.usersService.changePassword(email, newPassword);
    }
}