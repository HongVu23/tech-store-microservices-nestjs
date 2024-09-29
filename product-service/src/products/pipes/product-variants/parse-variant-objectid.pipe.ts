import { HttpStatus, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Types } from "mongoose";

export class ParseVariantObjectIdPipe implements PipeTransform<string, Types.ObjectId> {

    transform(value: string): Types.ObjectId {
        
        if (!Types.ObjectId.isValid(value)) {
            throw new RpcException({ message: 'Product variant not found', statusCode: HttpStatus.NOT_FOUND });
        }

        return new Types.ObjectId(value);
    }
}