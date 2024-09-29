import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Product } from "./product.schema";

@Schema({ timestamps: true })
export class ProductVariant {

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Product;

    @Prop({ required: false })
    ram: string;

    @Prop({ required: false })
    hardDrive: string;

    @Prop({ required: false })
    rom: string;

    @Prop({ required: true })
    color: string;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop(raw({
        discountPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        discountEndDate: {
            type: Date,
            required: function () {
                return this.discount.discountPercentage !== 0
            }
        }
    }))
    discount: Record<string, any>;

    @Prop(raw({
        imageName: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        }
    }))
    image: Record<string, any>;

    @Prop({ default: true })
    status: boolean;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);