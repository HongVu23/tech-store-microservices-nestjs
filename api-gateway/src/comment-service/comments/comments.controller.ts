import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { AuthGuard } from "src/auth-service/auth/guards/auth.guard";
import { CreateCommentDto } from "./dtos/create-comment.dto";
import { UpdateCommentDto } from "./dtos/update-comment.dto";
import { CreateReplyCommentDto } from "./dtos/create-reply-comment.dto";

@Controller('comments')
export class CommentsController {

    constructor(private commentsService: CommentsService) {}

    @Get()
    getComments(@Query('productId') productId: string) {
        return this.commentsService.getComments(productId);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(ValidationPipe)
    createComment(@Req() req: any, @Body() createCommentDto: CreateCommentDto) {
        return this.commentsService.createComment(req.user, createCommentDto);
    }

    @Patch(':commentId')
    @UseGuards(AuthGuard)
    @UsePipes(ValidationPipe)
    updateComment(@Req() req: any, @Param('commentId') commentId: string, @Body() updateCommentDto: UpdateCommentDto) {
        return this.commentsService.updateComment(req.user, commentId, updateCommentDto);
    }

    @Delete(':commentId')
    @UseGuards(AuthGuard)
    deleteComment(@Req() req: any, @Param('commentId') commentId: string) {
        return this.commentsService.deleteComment(req.user, commentId);
    }

    @Get(':commentId/replyComments')
    getReplyComments(@Param('commentId') commentId: string) {
        return this.commentsService.getReplyComments(commentId);
    }

    @Post(':commentId/replyComments')
    @UseGuards(AuthGuard)
    @UsePipes(ValidationPipe)
    createReplyComments(@Req() req: any, @Param('commentId') commentId: string, @Body() createReplyCommentDto: CreateReplyCommentDto) {
        return this.commentsService.createReplyComment(req.user, commentId, createReplyCommentDto);
    }
}