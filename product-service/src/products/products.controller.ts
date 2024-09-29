import { Controller, UseFilters } from "@nestjs/common";
import { ProductsService } from "./services/products.service";
import { AllExceptionsFilter } from "src/filters/all-exceptions.filter";
import { Product } from "./schemas/product.schema";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateProductDto } from "./dtos/products/create-product.dto";
import { DuplicateProductPipe } from "./pipes/products/duplicate-product.pipe";
import { ParseObjectIdPipe } from "./pipes/parse-objectid.pipe";
import { ParseProductPipe } from "./pipes/products/parse-product.pipe";
import { Document, Types } from "mongoose";
import { UpdateProductDto } from "./dtos/products/update-product.dto";
import { ProductVariantsService } from "./services/product-variants.service";
import { CreateProductVariantDto } from "./dtos/product-variants/create-product-variant.dto";
import { ExistsProductPipe } from "./pipes/product-variants/exists-product.pipe";
import { DuplicateProductVariantPipe } from "./pipes/product-variants/duplicate-product-variant.pipe";
import { RequiredFieldsValidationPipe as RequiredVariantFieldsValidationPipe } from "./pipes/product-variants/required-fields-validation.pipe";
import { ProductVariant } from "./schemas/product-variant.schema";
import { UpdateProductVariantDto } from "./dtos/product-variants/update-product-variant.dto";
import { ExistsProductVariantPipe } from "./pipes/product-variants/exists-product-variant.pipe";
import { DiscountValidationPipe } from "./pipes/product-variants/discount-validation.pipe";
import { ProductDetailsService } from "./services/product-details.service";
import { CreateProductDetailDto } from "./dtos/product-details/create-product-detail.dto";
import { DuplicateProductDetailPipe } from "./pipes/product-details/duplicate-product-detail.pipe";
import { RequiredFieldsValidationPipe as RequiredDetaildFieldsValidationPipe } from "./pipes/product-details/required-fields-validation.pipe";
import { ProductDetail } from "./schemas/product-detail.schema";
import { ExistsProductDetailPipe } from "./pipes/product-details/exists-product-detail.pipe";
import { UpdateProductDetailDto } from "./dtos/product-details/update-product-detail.dto";
import { ParseVariantObjectIdPipe } from "./pipes/product-variants/parse-variant-objectid.pipe";
import { ParseDetailObjectIdPipe } from "./pipes/product-details/parse-detail-objectid.pipe";

@Controller()
@UseFilters(AllExceptionsFilter)
export class ProductsController {

    constructor(
        private productsService: ProductsService,
        private productVariantsService: ProductVariantsService,
        private productDetailsService: ProductDetailsService
    ) { }

    @MessagePattern({ cmd: 'get-products' })
    getProducts(@Payload() category?: string): Promise<Product[]> {
        return this.productsService.getProducts(category);
    }

    @MessagePattern({ cmd: 'create-product' })
    createProduct(@Payload(DuplicateProductPipe) createProductDto: CreateProductDto): Promise<{ message: string }> {
        return this.productsService.createProduct(createProductDto);
    }

    @MessagePattern({ cmd: 'get-full-products-infos' })
    getFullProductsInfos(@Payload() category?: string): Promise<any[]> {
        return this.productsService.getFullProductsInfos(category);
    }

    @MessagePattern({ cmd: 'search-product-for-admin' })
    searchProductForAdmin(@Payload() text: string): Promise<any[]> {
        return this.productsService.searchProductForAdmin(text);
    }

    @MessagePattern({ cmd: 'search-product' })
    searchProduct(@Payload() text: string): Promise<any[]> {
        return this.productsService.searchProduct(text);
    }

    @MessagePattern({ cmd: 'update-product' })
    updateProduct(
        @Payload('productId', ParseObjectIdPipe, ParseProductPipe) product: Document<Types.ObjectId, any, Product>,
        @Payload('updateProductDto') updateProductDto: UpdateProductDto): Promise<{ message: string }> {

        return this.productsService.updateProduct(product, updateProductDto);
    }

    @MessagePattern({ cmd: 'delete-product' })
    deleteProduct(
        @Payload(ParseObjectIdPipe, ParseProductPipe) product: Document<Types.ObjectId, any, Product>): Promise<{ message: string }> {

        return this.productsService.deleteProduct(product);
    }

    @MessagePattern({ cmd: 'get-product' })
    getProduct(
        @Payload(
            ParseObjectIdPipe,
            ParseProductPipe)
        product: Document<Types.ObjectId, any, Product>): Document<Types.ObjectId, any, Product> {

        return this.productsService.getProduct(product);
    }

    @MessagePattern({ cmd: 'get-full-product-infos' })
    getFullProductInfos(@Payload(ParseObjectIdPipe, ParseProductPipe) product: Document<Types.ObjectId, any, Product>): Promise<any> {
        return this.productsService.getFullProductInfos(product);
    }
    


    /* ------------------------------- Product Variants ------------------------------- */



    @MessagePattern({ cmd: 'get-product-variants' })
    getProductVariants(@Payload(ParseObjectIdPipe) productId: Types.ObjectId): Promise<ProductVariant[]> {
        return this.productVariantsService.getProductVariants(productId);
    }

    @MessagePattern({ cmd: 'create-product-variant' })
    createProductVariant(
        @Payload(
            'createProductVariantDto',
            ExistsProductPipe,
            RequiredVariantFieldsValidationPipe,
            DiscountValidationPipe,
            DuplicateProductVariantPipe
        ) createProductVariantDto: CreateProductVariantDto,
        @Payload('image') image?: Express.Multer.File): Promise<{ message: string }> {

        return this.productVariantsService.createProductVariant(createProductVariantDto, image);
    }

    @MessagePattern({ cmd: 'update-product-variant' })
    updateProductVariant(
        @Payload(
            'updateProductVariantDto',
            ExistsProductPipe,
            ExistsProductVariantPipe,
            RequiredVariantFieldsValidationPipe,
            DiscountValidationPipe,
            DuplicateProductVariantPipe
        ) updateProductVaiantDto: UpdateProductVariantDto,
        @Payload('image') image?: Express.Multer.File) {

        return this.productVariantsService.updateProductVariant(updateProductVaiantDto, image);
    }

    @MessagePattern({ cmd: 'delete-product-variant' })
    deleteProductVariant(
        @Payload('productId', ParseObjectIdPipe) productId: Types.ObjectId,
        @Payload('productVariantId', ParseVariantObjectIdPipe) productVariantId: Types.ObjectId): Promise<{ message: string }> {

        return this.productVariantsService.deleteProductVariant(productId, productVariantId);
    }

    @MessagePattern({ cmd: 'get-product-variant' })
    getProductVariant(
        @Payload('productId', ParseObjectIdPipe) productId: Types.ObjectId,
        @Payload('productVariantId', ParseVariantObjectIdPipe) productVariantId: Types.ObjectId): Promise<ProductVariant> {

        return this.productVariantsService.getProductVariant(productId, productVariantId);
    }

    @MessagePattern({ cmd: 'get-product-variant-without-productid' })
    getProductVariantWithoutProductId(
        @Payload(ParseObjectIdPipe) productVariantId: Types.ObjectId): Promise<ProductVariant> {

        return this.productVariantsService.getProductVariantWithoutProductId(productVariantId);
    }

    @MessagePattern({ cmd: 'get-populated-product-variant-without-productid' })
    getPopulatedProductVariantWithoutProductId(
        @Payload(ParseObjectIdPipe) productVariantId: Types.ObjectId): Promise<ProductVariant> {
        
        return this.productVariantsService.getPopulatedProductVariantWithoutProductId(productVariantId);
    }



    /* ------------------------------- Product Details ------------------------------- */



    @MessagePattern({ cmd: 'get-product-detail' })
    getProductDetail(@Payload(ParseObjectIdPipe, ParseProductPipe) product: Document<Types.ObjectId, any, Product>): Promise<ProductDetail> {
        return this.productDetailsService.getProductDetail(product);
    }

    @MessagePattern({ cmd: 'create-product-detail' })
    createProductDetail(
        @Payload(
            ExistsProductPipe,
            DuplicateProductDetailPipe,
            RequiredDetaildFieldsValidationPipe
        ) createProductDetailDto: CreateProductDetailDto): Promise<{ message: string }> {

        return this.productDetailsService.createProductDetail(createProductDetailDto);
    }

    @MessagePattern({ cmd: 'update-product-detail' })
    updateProductDetail(
        @Payload(
            ExistsProductPipe,
            ExistsProductDetailPipe,
            RequiredDetaildFieldsValidationPipe
        ) updateProductDetailDto: UpdateProductDetailDto): Promise<{ message: string }> {

        return this.productDetailsService.updateProductDetail(updateProductDetailDto);
    }

    @MessagePattern({ cmd: 'delete-product-detail' })
    deleteProductDetail(
        @Payload('productId', ParseObjectIdPipe, ParseProductPipe) product: Document<Types.ObjectId, any, Product>,
        @Payload('productDetailId', ParseDetailObjectIdPipe) productDetailId: Types.ObjectId): Promise<{ message: string }> {

        return this.productDetailsService.deleteProductDetail(product, productDetailId);
    }

    /* Highlighted Images (Product Details) */

    @MessagePattern({ cmd: 'get-highlighted-images' })
    getHighlightedImages(
        @Payload('productDetailId', ParseDetailObjectIdPipe) productDetailId: Types.ObjectId,
        @Payload('productId', ParseObjectIdPipe, ParseProductPipe) product: Document<Types.ObjectId, any, Product>
        ): Promise<Record<string, string>[]> {

        return this.productDetailsService.getHighlightedImages(product, productDetailId);
    }

    @MessagePattern({ cmd: 'create-highlighted-images' })
    createHighlightedImages(
        @Payload('images') images: Array<Express.Multer.File>,
        @Payload('productDetailId', ParseDetailObjectIdPipe) productDetailId: Types.ObjectId,
        @Payload('productId', ParseObjectIdPipe, ParseProductPipe) product: Document<Types.ObjectId, any, Product>): Promise<{ message: string }> {

        return this.productDetailsService.createHighlightedImages(product, productDetailId, images);
    }

    @MessagePattern({ cmd: 'update-highlighted-images' })
    updateHighlightedImages(
        @Payload('productDetailId', ParseDetailObjectIdPipe) productDetailId: Types.ObjectId,
        @Payload('productId', ParseObjectIdPipe, ParseProductPipe) product: Document<Types.ObjectId, any, Product>,
        @Payload('images') images?: Array<Express.Multer.File>,
        @Payload('updatedImages') updateImages?: Record<string, string>[]): Promise<{ message: string }> {

        return this.productDetailsService.updateHighlightedImages(product, productDetailId, images, updateImages);
    }

    @MessagePattern({ cmd: 'delete-highlighted-images' })
    deleteHighlightedImages(
        @Payload('productDetailId', ParseDetailObjectIdPipe) productDetailId: Types.ObjectId,
        @Payload('productId', ParseObjectIdPipe, ParseProductPipe) product: Document<Types.ObjectId, any, Product>
        ): Promise<{ message: string }> {

        return this.productDetailsService.deleteHighlightedImages(product, productDetailId);
    }
}