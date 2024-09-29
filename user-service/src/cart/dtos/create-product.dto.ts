import { Types } from "mongoose";

export class CreateProductDto {

    productId: Types.ObjectId;

    quantity: number;

    inventory: Record<string, any>;
}