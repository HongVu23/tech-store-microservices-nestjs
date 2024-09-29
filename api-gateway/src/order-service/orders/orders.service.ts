import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { firstValueFrom } from "rxjs";

@Injectable()
export class OrdersService {

    constructor(@Inject('ORDER_SERVICE') private orderServiceClient: ClientProxy) {}

    async getOrders(user: any, queryUserId?: string) {
        try {
            const respone = await firstValueFrom(this.orderServiceClient.send({ cmd: 'get-orders' }, {
                user,
                queryUserId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async createOrder(user: any, createOrderDto: CreateOrderDto) {
        try {
            const respone = await firstValueFrom(this.orderServiceClient.send({ cmd: 'create-order' }, {
                user,
                ...createOrderDto
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async getStatistics(user: any) {
        try {
            const respone = await firstValueFrom(this.orderServiceClient.send({ cmd: 'get-statistics' }, user));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async getStatisticChart(year?: string, month?: string) {
        try {
            const respone = await firstValueFrom(this.orderServiceClient.send({ cmd: 'get-statistic-chart' }, {
                year,
                month
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async getOrder(user: any, orderId: string) {
        try {
            const respone = await firstValueFrom(this.orderServiceClient.send({ cmd: 'get-order' }, {
                user,
                orderId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }
}