import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schemas/user.schema";
import { Document, Model, Types } from "mongoose";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { User as IUser } from "../interfaces/user.interface";
import * as bcrypt from 'bcrypt';
import { firstValueFrom } from "rxjs";

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @Inject('AUTH_SERVICE') private authClientService: ClientProxy
    ) { }

    async getUsers(): Promise<User[]> {

        const users: User[] = await this.userModel.find({ role: 'User' }).select('-password').lean().exec();

        if (!users.length) throw new RpcException({ message: 'No users found', statusCode: HttpStatus.NOT_FOUND });

        return users;
    }

    async createUser(createUserDto: CreateUserDto): Promise<{ message: string }> {

        // check for duplicate username
        const duplicateUsername: User = await this.userModel.findOne({ username: createUserDto.username }).lean().exec();

        if (duplicateUsername) {
            throw new RpcException({ message: 'Duplicate username', statusCode: HttpStatus.CONFLICT });
        }

        // check for duplicate email
        const duplicateEmail: User = await this.userModel.findOne({ email: createUserDto.email }).lean().exec();

        if (duplicateEmail) {
            throw new RpcException({ message: 'Duplicate email', statusCode: HttpStatus.CONFLICT });
        }

        // hash password
        const hashPassword: string = await bcrypt.hash(createUserDto.password, 10);
        createUserDto.password = hashPassword;

        await this.userModel.create(createUserDto);
        return { message: 'User created' };
    }

    async searchUser(text: string): Promise<User[]> {

        if (!text) return [];
        
        const regex = new RegExp(text, 'i')
    
        const searchResults: User[] = await this.userModel.find({
            $or: [
                { username: regex },
                { email: regex }
            ]
        }).lean().exec()
    
        return searchResults;
    }

    async updateUser(loginUser: IUser, user: Document<Types.ObjectId, any, User>, updateUserDto: UpdateUserDto): Promise<any> {

        if (loginUser.role === 'User') {
            // check whether user id param and user id from token is match or not
            if (loginUser.id.toString() !== user._id.toString()) throw new RpcException({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
            if (updateUserDto.status) throw new RpcException({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
            // asign status for user
            updateUserDto.status = user.get('status');
        } else {
            if (updateUserDto.status == null) throw new RpcException({ message: 'All fields are required', statusCode: HttpStatus.BAD_REQUEST });
        }

        if (updateUserDto.password) {
            const hashPassword: string = await bcrypt.hash(updateUserDto.password, 10);
            user.set('password', hashPassword);
        }

        user.set('username', updateUserDto.username);
        user.set('email', updateUserDto.email);
        user.set('phoneNumber', updateUserDto.phoneNumber);
        user.set('address', updateUserDto.address);
        user.set('status', updateUserDto.status);

        const savedUser: Document<Types.ObjectId, any, User> = await user.save();

        if (loginUser.role === 'User') {
            // get tokens
            let tokens: any;
            try {
                tokens = await firstValueFrom(this.authClientService.send({ cmd: 'get-tokens' }, savedUser));
            } catch (err) { 
                throw new RpcException(err); 
            }
            
            const { accessToken, refreshToken } = tokens;

            return { accessToken, refreshToken };
        }

        return { message: 'User updated' };
    }

    async deleteUser(user: Document<Types.ObjectId, any, User>): Promise<{ message: string }> {

        await user.deleteOne(); 
        return { message: 'User deleted' };
    }

    getUser(user: Document<Types.ObjectId, any, User>): Document<Types.ObjectId, any, User> {
        return user;
    }

    async getUserByName(username: string): Promise<User> {

        const user: User = await this.userModel.findOne({ username }).lean().exec();

        if (!user) {
            throw new RpcException({ message: 'User not found', statusCode: HttpStatus.NOT_FOUND });
        }
        return user;
    }

    async getUserByEmail(email: string): Promise<User> {

        const user: User = await this.userModel.findOne({ email }).lean().exec();

        if (!user) {
            throw new RpcException({ message: 'User not found', statusCode: HttpStatus.NOT_FOUND });
        }
        return user;
    }

    async getUserQuantityStatistics(): Promise<Record<string, number>> {

        // get all customers
        const userQuantityStatistics: Record<string, number> = { numberOfUser: 0, numberOfEnableUser: 0, numberOfDisableUser: 0 };

        const users: User[] = await this.userModel.find({ role: 'User' }).lean().exec();
        userQuantityStatistics.numberOfUser = users.length;

        // total enable and disable users
        const userCount: any[] = await this.userModel.aggregate([
            { $match: { role: 'User' } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        let numberOfEnableUser: number = 0
        let numberOfDisableUser: number = 0

        for (const { _id, count } of userCount) {
            if (_id === true) {
                numberOfEnableUser = count
            } else if (_id === false) {
                numberOfDisableUser = count
            }
        }

        // asign to user object
        userQuantityStatistics.numberOfEnableUser = numberOfEnableUser;
        userQuantityStatistics.numberOfDisableUser = numberOfDisableUser;
        return userQuantityStatistics;
    }

    async changePassword(email: string, newPassword: string): Promise<{ message: string }> {

        const user: Document<Types.ObjectId, any, User> = await this.userModel.findOne({ email }).exec();

        // hashpasword
        const hashPassword: string = await bcrypt.hash(newPassword, 10);

        user.set('password', hashPassword);
        await user.save();
        return { message: 'Password changed' };
    }
}