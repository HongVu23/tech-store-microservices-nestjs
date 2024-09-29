import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Product, ProductSchema } from "./schemas/product.schema";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./services/products.service";
import { ProductVariantsService } from "./services/product-variants.service";
import { ProductVariant, ProductVariantSchema } from "./schemas/product-variant.schema";
import { StockServiceClientModule } from "src/rmq-client/stock-service-client.module";
import { ImageServiceClientModule } from "src/rmq-client/image-service-client.module";
import { ProductDetailsService } from "./services/product-details.service";
import { ProductDetail, ProductDetailSchema } from "./schemas/product-detail.schema";
import { ReviewServiceClientModule } from "src/rmq-client/review-service-client.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema }, 
            { name: ProductVariant.name, schema: ProductVariantSchema },
            { name: ProductDetail.name, schema: ProductDetailSchema }
        ]),
        StockServiceClientModule,
        ImageServiceClientModule,
        ReviewServiceClientModule
    ],
    controllers: [ProductsController],
    providers: [ProductsService, ProductVariantsService, ProductDetailsService]
})
export class ProductsModule {}