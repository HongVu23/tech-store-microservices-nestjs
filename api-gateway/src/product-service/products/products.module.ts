import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./services/products.service";
import { ProductVariansService } from "./services/product-variants.service";
import { ProductServiceClientModule } from "../rmq-client/product-service-client.module";
import { ProductDetailsService } from "./services/product-details.service";
import { AuthModule } from "src/auth-service/auth/auth.module";

@Module({
    imports: [ProductServiceClientModule, AuthModule],
    controllers: [ProductsController],
    providers: [ProductsService, ProductVariansService, ProductDetailsService]
})
export class ProductsModule {}