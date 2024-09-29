import { Controller, UseFilters } from "@nestjs/common";
import { CartService } from "./cart.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateProductDto } from "./dtos/create-product.dto";
import { AllExceptionsFilter } from "src/filters/all-exceptions.filter";
import { ExistsProductInInventory } from "./pipes/exists-product-in-inventory.pipe";
import { QuantityValidationPipe } from "./pipes/quantity-validation.pipe";
import { User } from "src/interfaces/user.interface";
import { Cart } from "./schemas/cart.schema";
import { FlattenMaps, Types } from "mongoose";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { ExistsProductCart } from "./pipes/exists-product-cart.pipe";

@Controller()
@UseFilters(AllExceptionsFilter)
export class CartController {
    
    constructor(private cartService: CartService) {}

    @MessagePattern({ cmd: 'get-products-in-cart' })
    getProducts(@Payload() user: User): Promise<(FlattenMaps<Cart> & { _id: Types.ObjectId })[]> {
        return this.cartService.getProducts(user);
    }

    @MessagePattern({ cmd: 'create-product-in-cart' })
    createProduct(
        @Payload('user') user: User,
        @Payload('createProductDto', ExistsProductInInventory, QuantityValidationPipe) createProductDto: CreateProductDto): Promise<{ message: string }> {
        
        return this.cartService.createProduct(user, createProductDto);
    }

    @MessagePattern({ cmd: 'delete-products-in-cart' })
    deleteProducts(@Payload() user: User): Promise<{ message: string }> {
        return this.cartService.deleteProducts(user);
    }

    @MessagePattern({ cmd: 'get-cart-statistics' })
    getCartStatistics(@Payload() user: User): Promise<any> {
        return this.cartService.getCartStatistics(user);
    }

    @MessagePattern({ cmd: 'update-product-in-cart' })
    updateProduct(
        @Payload('user') user: User, 
        @Payload('updateProductDto', ExistsProductCart) updateProductDto: UpdateProductDto): Promise<{ message: string }> {

        return this.cartService.updateProduct(user, updateProductDto);
    }

    @MessagePattern({ cmd: 'delete-product' })
    deleteProduct(@Payload('user') user: User, @Payload('cartId') cartId: string): Promise<{ message: string }> {
        return this.cartService.deleteProduct(user, cartId);
    }
}