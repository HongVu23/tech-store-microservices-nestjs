import { Types } from "mongoose";

export class CreateProductVariantDto {

    product: Types.ObjectId;

    ram?: string;

    hardDrive?: string;

    rom?: string;

    color: string;

    price: string;

    discount: Record<string, any>;

    quantity: string;
}