import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class ImportedProduct {

    @Prop({ type: Types.ObjectId, required: true })
    product: Types.ObjectId;

    @Prop({ default: 0, min: 0 })
    quantity: number;
}

export const ImportedProductSchema = SchemaFactory.createForClass(ImportedProduct);