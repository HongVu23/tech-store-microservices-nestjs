import { HttpStatus, PipeTransform } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Order } from "../schemas/order.schema";
import { RpcException } from "@nestjs/microservices";
import { Document } from "mongoose";

export class ParseOrderPipe implements PipeTransform<Types.ObjectId, Promise<Document<Types.ObjectId, any, Order>>> {

    constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

    async transform(orderId: Types.ObjectId): Promise<Document<Types.ObjectId, any, Order>> {
        
        const order: Document<Types.ObjectId, any, Order> = await this.orderModel.findOne({ _id: orderId }).exec();

        if (!order) throw new RpcException({ message: 'Order not found', statusCode: HttpStatus.NOT_FOUND });

        return order;
    }
}