import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";

@Injectable()
export class UsersService {

    constructor(@Inject('USER_SERVICE') private userServiceClient: ClientProxy) {}

    async getUsers() {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-users' }, {}));
            return respone;
        } catch (err) {
            throw new HttpException(err.message, err.statusCode);
        }
    }

    async createUser(createUserDto: CreateUserDto) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'create-user' }, createUserDto));
            return respone;
        } catch (err: any) {
            throw new HttpException(err.message, err.statusCode);
        }
    }

    async searchUser(text?: string) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'search-user' }, text ? text : ''));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async updateUser(user: any, userId: string, updateUserDto: UpdateUserDto) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'update-user' }, { user, userId, updateUserDto }));
            return respone;
        } catch (err: any) {
            throw new HttpException(err.message, err.statusCode);
        }
    }

    async deleteUser(userId: string) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'delete-user' }, userId));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async getUser(userId: string) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user' }, userId));
            return respone;
        } catch (err: any) {
            throw new HttpException(err.message, err.statusCode);
        }
    }
}