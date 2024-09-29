import { Types } from "mongoose";

export interface OrderItem {
    product: Types.ObjectId;
    quantity: number;
}