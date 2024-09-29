import { Module } from "@nestjs/common";
import { ImportedProductsController } from "./imported-products.controller";
import { ImportedProductsService } from "./imported-products.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ImportedProduct, ImportedProductSchema } from "./schemas/imported-product.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ImportedProduct.name, schema: ImportedProductSchema }])
    ],
    controllers: [ImportedProductsController],
    providers: [ImportedProductsService]
})
export class ImportedProductsModule {}