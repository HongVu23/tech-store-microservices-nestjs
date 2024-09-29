import { Module } from "@nestjs/common";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "./schemas/comment.schema";
import { ProductServiceClientModule } from "src/rmq-client/product-service-client.module";
import { UserServiceClientModule } from "src/rmq-client/user-service-client.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
        ProductServiceClientModule,
        UserServiceClientModule
    ],
    controllers: [CommentsController],
    providers: [CommentsService]
})
export class CommentsModule {}