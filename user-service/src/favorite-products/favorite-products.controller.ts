import { Controller } from "@nestjs/common";
import { FavoriteProductsService } from "./favorite-products.service";
import { User } from "src/interfaces/user.interface";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { FavoriteProduct } from "./schemas/favorite-product.schema";

@Controller()
export class FavoriteProductsController {

    constructor(private favoriteProductsService: FavoriteProductsService) {}

    @MessagePattern({ cmd: 'get-favorite-products' })
    getFavoriteProducts(user: User): Promise<FavoriteProduct[]> {
        return this.favoriteProductsService.getFavoriteProducts(user);
    }

    @MessagePattern({ cmd: 'create-favorite-product' })
    createFavoriteProduct(@Payload('user') user: User, @Payload('productId') productId: string) {
        return this.favoriteProductsService.createFavoriteProduct(user, productId);
    }
    
    @MessagePattern({ cmd: 'delete-favorite-product' })
    deleteFavoriteProduct(@Payload('user') user: User, @Payload('favoriteProductId') favoriteProductId: string): Promise<{ message: string }> {
        return this.favoriteProductsService.deleteFavoriteProduct(user, favoriteProductId);
    }
}