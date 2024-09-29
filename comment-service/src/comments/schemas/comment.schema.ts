import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Comment {

    @Prop({ required: true })
    content: string;

    @Prop({ type: Types.ObjectId, required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true })
    product: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }] })
    replyComments: Comment[];

    @Prop({ default: false })
    isReplyComment: boolean;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);