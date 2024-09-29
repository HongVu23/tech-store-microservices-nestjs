import { HttpStatus, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import { Comment } from "../schemas/comment.schema";

export class ExistsCommentPipe implements PipeTransform<string, Promise<Document<Types.ObjectId, any, Comment>>> {

    constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>) {}

    async transform(commentId: string): Promise<Document<Types.ObjectId, any, Comment>> {
        
        if (!Types.ObjectId.isValid(commentId)) throw new RpcException({ message: 'Comment not found', statusCode: HttpStatus.NOT_FOUND });

        const comment: Document<Types.ObjectId, any, Comment> = await this.commentModel.findOne({ _id: new Types.ObjectId(commentId) }).exec();

        if (!comment) throw new RpcException({ message: 'Comment not found', statusCode: HttpStatus.NOT_FOUND });

        return comment;
    }
}