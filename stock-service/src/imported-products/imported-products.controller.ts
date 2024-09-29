import { Controller, ParseIntPipe } from "@nestjs/common";
import { ImportedProductsService } from "./imported-products.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ParseObjectIdPipe } from "src/pipes/parse-objectid.pipe";
import { Types } from "mongoose";

@Controller()
export class ImportedProductsController {

    constructor(private importedProductsService: ImportedProductsService) {}

    @MessagePattern({ cmd: 'add-product-to-imported-products' })
    addProductToImportedProducts(
        @Payload('productId', ParseObjectIdPipe) productId: Types.ObjectId, 
        @Payload('quantity', ParseIntPipe) quantity: number): Promise<{ message: string }> {
        
        return this.importedProductsService.addProductToImportedProducts(productId, quantity);
    }

    @MessagePattern({ cmd: 'update-product-quantity-in-imported-products' })
    updateProductQuantity(
        @Payload('productId', ParseObjectIdPipe) productId: Types.ObjectId, 
        @Payload('quantity', ParseIntPipe) quantity: number): Promise<{ message: string }> {

        return this.importedProductsService.updateProductQuantity(productId, quantity);
    }

    @MessagePattern({ cmd: 'delete-product-in-imported-products' })
    deleteProduct(@Payload(ParseObjectIdPipe) productId: Types.ObjectId): Promise<{ message: string }> {
        return this.importedProductsService.deleteProduct(productId);
    }
}