import { /*ArgumentMetadata,*/ HttpStatus, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Types } from 'mongoose';

export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
    transform(value: string, /*metadata: ArgumentMetadata*/): Types.ObjectId {
        
        if (!Types.ObjectId.isValid(value)) {
            throw new RpcException({ message: 'User not found', statusCode: HttpStatus.NOT_FOUND });
        }

        return new Types.ObjectId(value);
    }
}