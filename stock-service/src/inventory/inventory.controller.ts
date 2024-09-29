import { Controller, ParseIntPipe, UseFilters } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Types } from "mongoose";
import { AllExceptionsFilter } from "src/filters/all-exceptions.filter";
import { ParseObjectIdPipe } from "src/pipes/parse-objectid.pipe";
import { Inventory } from "./schemas/inventory.schema";

@Controller()
@UseFilters(AllExceptionsFilter)
export class InventoryController {

    constructor(private inventoryService: InventoryService) {}
    
    @MessagePattern({ cmd: 'get-product-in-inventory' })
    getProductInInventory(@Payload(ParseObjectIdPipe) productId: Types.ObjectId): Promise<Inventory> {
        return this.inventoryService.getProductInInventory(productId);
    }

    @MessagePattern({ cmd: 'add-product-to-inventory' })
    addProductToInventory(
        @Payload('productId', ParseObjectIdPipe) productId: Types.ObjectId, 
        @Payload('quantity', ParseIntPipe) quantity: number): Promise<{ message: string }> {
        
        return this.inventoryService.addProductToInventory(productId, quantity);
    } 

    @MessagePattern({ cmd: 'update-product-quantity-in-inventory' })
    updateProductQuantity(
        @Payload('productId', ParseObjectIdPipe) productId: Types.ObjectId,
        @Payload('quantity', ParseIntPipe) quantity: number): Promise<{ message: string }>  {

        return this.inventoryService.updateProductQuantity(productId, quantity);
    }

    @MessagePattern({ cmd: 'delete-product-in-inventory' })
    deleteProduct(@Payload(ParseObjectIdPipe) productId: Types.ObjectId): Promise<{ message: string }> {
        return this.inventoryService.deleteProduct(productId);
    }

    @MessagePattern({ cmd: 'reduce-product-quantity-in-inventory' })
    reduceProductQuantity(
        @Payload('productId', ParseObjectIdPipe) productId: Types.ObjectId,
        @Payload('quantity', ParseIntPipe) quantity: number): Promise<{ message: string }> {

        console.log({ productId, quantity })

        return this.inventoryService.reduceProductQuantity(productId, quantity);
    }

    @MessagePattern({ cmd: 'get-total-products-quantity' })
    getTotalProductsQuantity(): Promise<number> {
        return this.inventoryService.getTotalProductsQuantity();
    }
}