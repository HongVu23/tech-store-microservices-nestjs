import { Document, Types } from "mongoose";
import { ProductVariant } from "src/products/schemas/product-variant.schema";

export class UpdateProductVariantDto {

    product: Types.ObjectId;

    productVariant: Types.ObjectId;

    ram?: string;

    hardDrive?: string;

    rom?: string;

    color: string;

    price: string;

    discount: Record<string, any>;

    status: string;

    quantity: string;

    productVariantObj: Document<Types.ObjectId, any, ProductVariant>;
}