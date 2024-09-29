import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class FavoriteProduct {

    @Prop({ type: Types.ObjectId })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId })
    product: Types.ObjectId;
}
export const FavoriteProductSchema = SchemaFactory.createForClass(FavoriteProduct);