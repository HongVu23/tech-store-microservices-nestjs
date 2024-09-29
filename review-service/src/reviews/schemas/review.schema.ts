import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Review {

    @Prop({ required: true })
    content: string;

    @Prop({ type: Types.ObjectId, required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true })
    product: Types.ObjectId;

    @Prop([{ type: Types.ObjectId }])
    likes: Types.ObjectId[];

    @Prop([{ type: Types.ObjectId }])
    dislikes: Types.ObjectId[];

    @Prop([raw({
        imageName: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        }
    })])
    images: Record<string, any>[];

    @Prop({ required: true, enum: [1, 2, 3, 4, 5] })
    ratingStar: number;
}
export const ReviewSchema = SchemaFactory.createForClass(Review);