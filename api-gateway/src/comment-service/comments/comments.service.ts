import { BadRequestException, HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateCommentDto } from "./dtos/create-comment.dto";
import { firstValueFrom } from "rxjs";
import { UpdateCommentDto } from "./dtos/update-comment.dto";
import { CreateReplyCommentDto } from "./dtos/create-reply-comment.dto";

@Injectable()
export class CommentsService {

    constructor(@Inject('COMMENT_SERVICE') private commentServiceClient: ClientProxy) {}

    async getComments(productId: string) {

        if (!productId) throw new BadRequestException('All fields are required');

        try {
            const respone = await firstValueFrom(this.commentServiceClient.send({ cmd: 'get-comments' }, productId));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async createComment(user: any, createCommentDto: CreateCommentDto) {
        try {
            const respone = await firstValueFrom(this.commentServiceClient.send({ cmd: 'create-comment' }, {
                user,
                createCommentDto
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async updateComment(user: any, commentId: string, updateCommentDto: UpdateCommentDto) {
        try {
            const respone = await firstValueFrom(this.commentServiceClient.send({ cmd: 'update-comment' }, {
                user,
                commentId,
                updateCommentDto
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async deleteComment(user: any, commentId: string) {
        try {
            const respone = await firstValueFrom(this.commentServiceClient.send({ cmd: 'delete-comment' }, {
                user,
                commentId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async getReplyComments(commentId: string) {
        try {
            const respone = await firstValueFrom(this.commentServiceClient.send({ cmd: 'get-reply-comments' }, commentId));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async createReplyComment(user: any, commentId: string, createReplyCommentDto: CreateReplyCommentDto) {
        try {
            const respone = await firstValueFrom(this.commentServiceClient.send({ cmd: 'create-reply-comment' }, {
                user,
                commentId,
                createReplyCommentDto
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }
}