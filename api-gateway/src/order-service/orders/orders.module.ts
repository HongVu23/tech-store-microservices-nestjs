import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { OrderServiceClientModule } from "../rmq-client/order-service-client.module";
import { AuthModule } from "src/auth-service/auth/auth.module";

@Module({
    imports: [OrderServiceClientModule, AuthModule],
    controllers: [OrdersController],
    providers: [OrdersService]
})
export class OrdersModule {}