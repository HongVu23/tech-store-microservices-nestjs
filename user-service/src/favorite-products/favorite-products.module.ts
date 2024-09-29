import { Module } from "@nestjs/common";
import { FavoriteProductsController } from "./favorite-products.controller";
import { FavoriteProductsService } from "./favorite-products.service";
import { MongooseModule } from "@nestjs/mongoose";
import { FavoriteProduct, FavoriteProductSchema } from "./schemas/favorite-product.schema";
import { ProductServiceClientModule } from "./rmq-client/product-service-client.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: FavoriteProduct.name, schema: FavoriteProductSchema }]),
        ProductServiceClientModule
    ],
    controllers: [FavoriteProductsController],
    providers: [FavoriteProductsService]
})
export class FavoriteProductsModule {}