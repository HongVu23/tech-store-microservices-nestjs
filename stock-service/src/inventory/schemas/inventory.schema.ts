import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Inventory {

    @Prop({ type: Types.ObjectId, required: true })
    product: Types.ObjectId;

    @Prop({ default: 0, min: 0 })
    quantity: number;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);