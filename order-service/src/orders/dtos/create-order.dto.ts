import { OrderItem } from "../schemas/order.schema";

export class CreateOrderDto {

    user: any;

    orderItems: OrderItem[];

    phoneNumber?: string;

    address?: string;

    paymentMethod: string;
}