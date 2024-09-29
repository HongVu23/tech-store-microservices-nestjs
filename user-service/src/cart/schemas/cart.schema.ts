import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Cart {

    @Prop({ type: Types.ObjectId, required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: true })
    product: Types.ObjectId;

    @Prop({ min: 0 })
    quantity: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);