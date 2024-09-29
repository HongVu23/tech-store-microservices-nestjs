import { Module } from "@nestjs/common";
import { CommentServiceClientModule } from "../rmq-client/comment-service-client.module";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";
import { AuthModule } from "src/auth-service/auth/auth.module";

@Module({
    imports: [CommentServiceClientModule, AuthModule],
    controllers: [CommentsController],
    providers: [CommentsService]
})
export class CommentsModule {}