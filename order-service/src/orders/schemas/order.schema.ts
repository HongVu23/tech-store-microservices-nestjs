import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: false, _id: false })
export class OrderItem {

    @Prop({ type: Types.ObjectId, required: true })
    product: Types.ObjectId;

    @Prop({ required: true, min: 0 })
    quantity: number;

    @Prop({ required: true, min: 0 })
    total: number;
}

@Schema({ timestamps: true })
export class Order {

    @Prop({ type: Types.ObjectId, required: true })
    user: Types.ObjectId;

    @Prop([OrderItem])
    orderItems: OrderItem[];

    @Prop({ required: true, minLenght: 10, maxLenght: 10, match: [/^[0-9]{10}$/, 'Phone number is invalid'] })
    phoneNumber: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true, min: 0 })
    total: number;

    @Prop({ required: true, enum: ['Payment on delivery', 'Online payment'] })
    paymentMethod: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);