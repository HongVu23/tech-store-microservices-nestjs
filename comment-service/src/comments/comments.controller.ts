import { Controller, UseFilters } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { User } from "src/interfaces/user.interface";
import { CreateCommentDto } from "./dtos/create-comment.dto";
import { AllExceptionsFilter } from "src/filters/all-exceptions.filter";
import { ExistsProductPipe } from "./pipes/exists-product.pipe";
import { Comment } from "./schemas/comment.schema";
import { Document, Types } from "mongoose";
import { ExistsCommentPipe } from "./pipes/exists-comment.pipe";
import { CreateReplyCommentDto } from "./dtos/create-reply-comment.dto";

@Controller()
@UseFilters(AllExceptionsFilter)
export class CommentsController {

    constructor(private commentsService: CommentsService) { }

    @MessagePattern({ cmd: 'get-comments' })
    getComments(@Payload() productId: string): Promise<Comment[]> {
        return this.commentsService.getComments(productId);
    }

    @MessagePattern({ cmd: 'create-comment' })
    createComment(
        @Payload('user') user: User,
        @Payload('createCommentDto', ExistsProductPipe) createCommentDto: CreateCommentDto): Promise<{ message: string }> {

        return this.commentsService.createComment(user, createCommentDto);
    }

    @MessagePattern({ cmd: 'update-comment' })
    updateComment(
        @Payload('user') user: User,
        @Payload('commentId', ExistsCommentPipe) comment: Document<Types.ObjectId, any, Comment>,
        @Payload('updateCommentDto') updateCommentDto) {

        return this.commentsService.updateComment(user, comment, updateCommentDto);
    }

    @MessagePattern({ cmd: 'delete-comment' })
    deleteComment(
        @Payload('user') user: User, 
        @Payload('commentId', ExistsCommentPipe) comment: Document<Types.ObjectId, any, Comment>): Promise<{ message: string }> {
        
        return this.commentsService.deleteComment(user, comment);
    }

    @MessagePattern({ cmd: 'get-reply-comments' })
    getReplyComments(@Payload(ExistsCommentPipe) comment: Document<Types.ObjectId, any, Comment>): Promise<Comment[]> {
        return this.commentsService.getReplyComments(comment);
    }

    @MessagePattern({ cmd: 'create-reply-comment' })
    createReplyComment(
        @Payload('user') user: User, 
        @Payload('commentId', ExistsCommentPipe) comment: Document<Types.ObjectId, any, Comment>, 
        @Payload('createReplyCommentDto') createReplyCommentDto: CreateReplyCommentDto): Promise<{ message: string }> {
        
        return this.commentsService.crreateReplyComment(user, comment, createReplyCommentDto);
    }
}