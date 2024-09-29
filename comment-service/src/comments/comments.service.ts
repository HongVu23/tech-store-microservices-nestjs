import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Comment } from "./schemas/comment.schema";
import { Document, Model, Types } from "mongoose";
import { User } from "src/interfaces/user.interface";
import { CreateCommentDto } from "./dtos/create-comment.dto";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { updateCommentDto } from "./dtos/update-comment.dto";
import { CreateReplyCommentDto } from "./dtos/create-reply-comment.dto";

@Injectable()
export class CommentsService {

    constructor(
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        @Inject('PRODUCT_SERVICE') private productServiceClient: ClientProxy,
        @Inject('USER_SERVICE') private userServiceClient: ClientProxy
    ) { }

    async getComments(productId: string): Promise<Comment[]> {

        // check whether product is exist or not
        try {
            await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product' }, productId));
        } catch (err) { throw new RpcException(err); }

        const comments: Comment[] = await this.commentModel.find({ product: new Types.ObjectId(productId), isReplyComment: false }).lean().exec();

        // get user info
        for (const comment of comments) {
            let user: any;
            try {
                user = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user' }, comment.user));
            } catch (err) { throw new RpcException(err); }
            // asign user
            comment.user = user;
        }

        return comments;
    }

    async createComment(user: User, createCommentDto: CreateCommentDto): Promise<{ message: string }> {

        await this.commentModel.create({
            content: createCommentDto.content,
            user: new Types.ObjectId(user.id),
            product: new Types.ObjectId(createCommentDto.productId)
        })

        return { message: 'Comment created' };
    }

    async updateComment(user: User, comment: Document<Types.ObjectId, any, Comment>, updateCommentDto: updateCommentDto): Promise<{ message: string }> {

        comment.set('content', updateCommentDto.content);

        await comment.save();

        return { message: 'Comment updated'  };
    }

    async deleteComment(user: User, comment: Document<Types.ObjectId, any, Comment>) {

        // check this is the valid user
        if (user.id.toString() !== comment.get('user').toString()) {
            throw new RpcException({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });
        }

        await comment.deleteOne();
        return { message: 'Comment deleted' };
    }

    async getReplyComments(comment: Document<Types.ObjectId, any, Comment>): Promise<Comment[]> {

        if (!comment.get('replyComments').length) {
            return [];
        }
    
        // retunred reuslt
        const result: Comment[] = [];
        const replyComments: Comment[] = comment.get('replyComments');
        for (const replyComment of replyComments) {
            const tmpRepComment: Comment = await this.commentModel.findOne({ _id: new Types.ObjectId(replyComment as unknown as string) }).lean().exec();

            // get user
            try {
                const user: any = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user' }, tmpRepComment.user));
                tmpRepComment.user = user;
            } catch (err) { throw new RpcException(err); }

            result.push(tmpRepComment);
        }
    
        return result;
    }

    async crreateReplyComment(user: User, comment: Document<Types.ObjectId, any, Comment>, createReplyCommentDto: CreateReplyCommentDto): Promise<{ message: string }> {
    
        const replyComment: Document<Types.ObjectId, any, Comment> = await this.commentModel.create({
            content: createReplyCommentDto.content,
            user: new Types.ObjectId(user.id),
            product: comment.get('product'),
            isReplyComment: true
        })
    
        // get reply comments
        let replyComments: any = comment.get('replyComments');
        replyComments = [...replyComments, replyComment._id];
        comment.set('replyComments', replyComments);
    
        await comment.save()
        return { message: 'Reply comment created' };
    }
}