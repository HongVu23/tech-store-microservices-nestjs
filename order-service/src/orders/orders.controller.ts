import { Controller, UseFilters } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { AllExceptionsFilter } from "src/filters/all-exceptions.filter";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { OrderItemsValidationPipe } from "./pipes/order-items-validation.pipe";
import { User } from "./interfaces/user.interface";
import { Order } from "./schemas/order.schema";
import { ParseObjectIdPipe } from "./pipes/parse-objectid.pipe";
import { ParseOrderPipe } from "./pipes/parse-order.pipe";
import { Document, Types } from "mongoose";

@Controller()
@UseFilters(AllExceptionsFilter)
export class OrdersController {

    constructor(private ordersService: OrdersService) {}

    @MessagePattern({ cmd: 'get-orders' })
    getOrders(@Payload('user') user: User, @Payload('queryUserId') queryUserId?: string): Promise<Order[]> {
        return this.ordersService.getOrders(user, queryUserId);
    }

    @MessagePattern({ cmd: 'create-order' })
    createOrder(@Payload(OrderItemsValidationPipe) createOrderDto: CreateOrderDto): Promise<{ message: string }> {
        return this.ordersService.createOrder(createOrderDto);
    }

    @MessagePattern({ cmd: 'get-statistics' })
    getStatistics(admin: User): Promise<Record<string, any>> {
        return this.ordersService.getStatistics(admin);
    }

    @MessagePattern({ cmd: 'get-statistic-chart' })
    getStatisticChart(
        @Payload('year') year?: string,
        @Payload('month') month?: string): Promise<any[]> {

        return this.ordersService.getStatisticChart(year, month);
    }

    @MessagePattern({ cmd: 'get-order' })
    getOrder(
        @Payload('user') user: User, 
        @Payload('orderId', ParseObjectIdPipe, ParseOrderPipe) order: Document<Types.ObjectId, any, Order>): Promise<Document<Types.ObjectId, any, Order>> {
        
        return this.ordersService.getOrder(user, order);
    }
}