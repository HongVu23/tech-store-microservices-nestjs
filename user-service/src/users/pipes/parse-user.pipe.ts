import { HttpStatus, PipeTransform } from "@nestjs/common";
import { Document, Model, Types } from "mongoose";
import { User } from "../schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { RpcException } from "@nestjs/microservices";

export class ParseUserPipe implements PipeTransform<Types.ObjectId, Promise<Document<Types.ObjectId, any, User>>> {

    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async transform(userId: Types.ObjectId, /*metadata: ArgumentMetadata*/): Promise<Document<Types.ObjectId, any, User>> {
        
        const user = await this.userModel.findOne({ _id: userId }).select('-password').exec();

        if (!user) {
            throw new RpcException({ message: 'User not found', statusCode: HttpStatus.NOT_FOUND });
        }
        
        return user;
    }
}