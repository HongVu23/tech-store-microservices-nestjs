import { Body, Controller, Get, Param, Patch, Post, Delete, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, UploadedFiles, Query, UseGuards } from "@nestjs/common";
import { ProductsService } from "./services/products.service";
import { CreateProductDto } from "./dtos/products/create-product.dto";
import { UpdateProductDto } from "./dtos/products/update-product.dto";
import { CreateProductVariantDto } from "./dtos/product-variants/create-product-variant.dto";
import { ProductVariansService } from "./services/product-variants.service";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { UpdateProductVariantDto } from "./dtos/product-variants/update-product-variant.dto";
import { CreateProductDetailDto } from "./dtos/product-details/create-product-detail.dto";
import { ProductDetailsService } from "./services/product-details.service";
import { UpdateProductDetailDto } from "./dtos/product-details/update-product-detail.dto";
import { AuthGuard } from "src/auth-service/auth/guards/auth.guard";
import { RolesGuard } from "src/auth-service/auth/guards/roles.guard";
import { Role } from "src/decorators/role.decorator";

@Controller('products')
export class ProductsController {

    constructor(
        private productsService: ProductsService,
        private productVariansService: ProductVariansService,
        private productDetailsService: ProductDetailsService
    ) { }

    @Get()
    getProducts(@Query('category') category?: string) {
        return this.productsService.getProducts(category);
    }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    @UsePipes(ValidationPipe)
    createProduct(@Body() createProductDto: CreateProductDto) {
        return this.productsService.createProduct(createProductDto);
    }

    @Get('list')
    getFullProductsInfos(@Query('category') category?: string) {
        return this.productsService.getFullProductsInfos(category);
    }

    @Get('search')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    searchProductForAdmin(@Query('text') text: string) {
        return this.productsService.searchProductForAdmin(text);
    }

    @Get('list/search')
    searchProduct(@Query('text') text: string) {
        return this.productsService.searchProduct(text);
    }

    @Patch(':productId')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    @UsePipes(ValidationPipe)
    updateProduct(@Param('productId') productId: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.updateProduct(productId, updateProductDto);
    }

    @Delete(':productId')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    deleteProduct(@Param('productId') productId: string) {
        return this.productsService.deleteProduct(productId);
    }

    @Get(':productId')
    getProduct(@Param('productId') productId: string) {
        return this.productsService.getProduct(productId);
    }

    @Get(':productId/fullInfos')
    getFullProductInfos(@Param('productId') productId: string) {
        return this.productsService.getFullProductInfos(productId);
    }



    /* ------------------------------- Product Variants ------------------------------- */



    @Get(':productId/variants')
    getProductVariants(@Param('productId') productId: string) {
        return this.productVariansService.getProductVariants(productId);
    }

    @Post(':productId/variants')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    @UseInterceptors(FileInterceptor('image'))
    @UsePipes(ValidationPipe)
    createProductVariant(
        @Param('productId') productId: string,
        @Body() createProductVariantDto: CreateProductVariantDto,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: 'jpeg|jpg|png'
                })
                .addMaxSizeValidator({
                    maxSize: 5 * 1024 * 1024 // 5MB
                })
                .build({
                    fileIsRequired: false,
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) image?: Express.Multer.File) {

        return this.productVariansService.createProductVariant(productId, createProductVariantDto, image);
    }

    @Patch(':productId/variants/:productVariantId')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    @UseInterceptors(FileInterceptor('image'))
    @UsePipes(ValidationPipe)
    updateProductVariant(
        @Param('productId') productId: string,
        @Param('productVariantId') productVariantId: string,
        @Body() updateProductVariantDto: UpdateProductVariantDto,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: 'jpeg|jpg|png'
                })
                .addMaxSizeValidator({
                    maxSize: 5 * 1024 * 1024 // 5MB
                })
                .build({
                    fileIsRequired: false,
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) image?: Express.Multer.File) {

        return this.productVariansService.updateProductVariant(productId, productVariantId, updateProductVariantDto, image);
    }

    @Delete(':productId/variants/:productVariantId')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    deleteProductVariant(@Param('productId') productId: string, @Param('productVariantId') productVariantId: string) {
        return this.productVariansService.deleteProductVariant(productId, productVariantId);
    }

    @Get(':productId/variants/:productVariantId')
    getProductVariant(@Param('productId') productId: string, @Param('productVariantId') productVarianId: string) {
        return this.productVariansService.getProductVariant(productId, productVarianId);
    }



    /* ------------------------------- Product Details ------------------------------- */



    @Get(':productId/details')
    getProductDetail(@Param('productId') productId: string) {
        return this.productDetailsService.getProductDetail(productId);
    }

    @Post(':productId/details')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    createProductDetail(@Param('productId') productId: string, @Body() createProductDetailDto: CreateProductDetailDto) {
        return this.productDetailsService.createProductDetail(productId, createProductDetailDto);
    }

    @Patch(':productId/details/:productDetailId')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    updateProductDetail(
        @Param('productId') productId: string,
        @Param('productDetailId') productDetailId: string,
        @Body() updateProductDetailDto: UpdateProductDetailDto) {
        return this.productDetailsService.updateProductDetail(productId, productDetailId, updateProductDetailDto);
    }

    @Delete(':productId/details/:productDetailId')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    deleteProductDetail(@Param('productId') productId: string, @Param('productDetailId') productDetailId: string) {
        return this.productDetailsService.deleteProductDetail(productId, productDetailId);
    }

    /* Highlighted Images (Product Details) */

    @Get(':productId/details/:productDetailId/highlightedImages')
    getHighlightedImages(
        @Param('productId') productId: string,
        @Param('productDetailId') productDetailId: string
        ) {

        return this.productDetailsService.getHighlightedImages(productId, productDetailId);
    }

    @Post(':productId/details/:productDetailId/highlightedImages')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    @UseInterceptors(FilesInterceptor('images', 10))
    createHighlightedImages(
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: 'jpeg|jpg|png'
                })
                .addMaxSizeValidator({
                    maxSize: 5 * 1024 * 1024 // 5MB
                })
                .build({
                    fileIsRequired: true,
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) images: Array<Express.Multer.File>,
        @Param('productId') productId: string,
        @Param('productDetailId') productDetailId: string) {

        return this.productDetailsService.createHighlightedImages(productId, productDetailId, images);
    }

    @Patch(':productId/details/:productDetailId/highlightedImages')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    @UseInterceptors(FilesInterceptor('images', 10))
    updateHighlightedImages(
        @Param('productId') productId: string,
        @Param('productDetailId') productDetailId: string,
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: 'jpeg|jpg|png'
                })
                .addMaxSizeValidator({
                    maxSize: 5 * 1024 * 1024 // 5MB
                })
                .build({
                    fileIsRequired: false,
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) images?: Array<Express.Multer.File>,
        @Body('updatedImages') updatedImages?: string) {

        return this.productDetailsService.updateHighlightedImages(productId, productDetailId, images, updatedImages);
    }

    @Delete(':productId/details/:productDetailId/highlightedImages')
    @UseGuards(AuthGuard, RolesGuard)
    @Role('Admin')
    deleteHighlightedImages(
        @Param('productId') productId: string,
        @Param('productDetailId') productDetailId: string) {

        return this.productDetailsService.deleteHighlightedImages(productId, productDetailId);
    }
}