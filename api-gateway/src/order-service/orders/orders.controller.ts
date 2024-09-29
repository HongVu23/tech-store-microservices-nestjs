import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { AuthGuard } from "src/auth-service/auth/guards/auth.guard";
import { CreateOrderDto } from "./dtos/create-order.dto";

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {

    constructor(private ordersService: OrdersService) {}

    @Get()
    getOrders(@Req() req: any, @Query('userId') queryUserId?: string) {
        return this.ordersService.getOrders(req.user, queryUserId);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createOrder(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.createOrder(req.user, createOrderDto);
    }

    @Get('statistics')
    getStatistics(@Req() req: any) {
        return this.ordersService.getStatistics(req.user);
    }

    @Get('statistics/chart')
    getStatisticChart(@Query('year') year?: string, @Query('month') month?: string) {
        return this.ordersService.getStatisticChart(year, month);
    }

    @Get(':orderId')
    getOrder(@Req() req: any, @Param('orderId') orderId: string) {
        return this.ordersService.getOrder(req.user, orderId);
    }
}