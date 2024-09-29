import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { FavoriteProductsService } from "./favorite-products.service";
import { AuthGuard } from "src/auth-service/auth/guards/auth.guard";

@Controller('favoriteProducts')
@UseGuards(AuthGuard)
export class FavoriteProductsController {

    constructor(private favoriteProductsService: FavoriteProductsService) {}

    @Get()
    getFavoriteProducts(@Req() req: any) {
        return this.favoriteProductsService.getFavoriteProducts(req.user);
    }

    @Post()
    createFavoriteProduct(@Req() req: any, @Body('productId') productId: string) {
        return this.favoriteProductsService.createFavoriteProduct(req.user, productId);
    }

    @Delete(':favoriteProductId')
    deleteFavortieProduct(@Req() req: any, @Param('favoriteProductId') favoriteProductId: string) {
        return this.favoriteProductsService.deleteFavoriteProduct(req.user, favoriteProductId);
    }
}