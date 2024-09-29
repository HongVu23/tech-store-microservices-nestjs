import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { CartService } from "./cart.service";
import { AuthGuard } from "src/auth-service/auth/guards/auth.guard";
import { CreateProductDto } from "./dtos/create-product.dto";

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {

    constructor(private cartService: CartService) {}

    @Get()
    getProducts(@Req() req: any) {
        return this.cartService.getProducts(req.user);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createProduct(@Req() req: any, @Body() createProductDto: CreateProductDto) {
        return this.cartService.createProduct(req.user, createProductDto);
    }

    @Delete('all')
    deleteProducts(@Req() req: any) {
        return this.cartService.deleteProducts(req.user);
    }

    @Get('statistics')
    getCartStatistics(@Req() req: any) {
        return this.cartService.getCartStatistics(req.user);
    }

    @Patch(':cartId')
    updateProduct(@Req() req: any, @Param('cartId') cartId: string, @Body('quantity') quantity: number) {
        return this.cartService.updateProduct(req.user, cartId, quantity);
    }

    @Delete(':cartId')
    deleteProduct(@Req() req: any, @Param('cartId') cartId: string) {
        return this.cartService.deleteProduct(req.user, cartId);
    }
}