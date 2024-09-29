import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "./schemas/order.schema";
import { StockServiceClientModule } from "src/rmq-client/stock-service-client.module";
import { UserServiceClientModule } from "src/rmq-client/user-service-client.module";
import { ProductServiceClientModule } from "src/rmq-client/product-service-client.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
        StockServiceClientModule,
        ProductServiceClientModule,
        UserServiceClientModule
    ],
    controllers: [OrdersController],
    providers: [OrdersService]
})
export class OrdersModule {}