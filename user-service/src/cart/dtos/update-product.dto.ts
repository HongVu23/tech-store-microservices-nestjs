import { Document, Types } from "mongoose";
import { Cart } from "../schemas/cart.schema";

export class UpdateProductDto {

    cartId: Types.ObjectId;

    quantity: number;

    productCart: Document<Types.ObjectId, any, Cart>;
}