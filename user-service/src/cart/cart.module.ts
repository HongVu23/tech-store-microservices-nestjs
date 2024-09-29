import { Module } from "@nestjs/common";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Cart, CartSchema } from "./schemas/cart.schema";
import { StockServiceClientModule } from "./rmq-client/stock-service-client.module";
import { ProductServiceClientModule } from "./rmq-client/product-service-client.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
        StockServiceClientModule,
        ProductServiceClientModule
    ],
    controllers: [CartController],
    providers: [CartService]
})
export class CartModule {}