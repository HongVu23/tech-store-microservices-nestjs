import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateProductDetailDto } from "../dtos/product-details/create-product-detail.dto";
import { firstValueFrom } from "rxjs";
import { UpdateProductDetailDto } from "../dtos/product-details/update-product-detail.dto";

@Injectable()
export class ProductDetailsService {

    constructor(@Inject('PRODUCT_SERVICE') private productServiceClient: ClientProxy) {}
    
    async getProductDetail(productId: string) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product-detail' }, productId));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async createProductDetail(productId: string, createProductDetailDto: CreateProductDetailDto) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'create-product-detail' }, {
                product: productId,
                ...createProductDetailDto
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async updateProductDetail(productId: string, productDetailId: string, updateProductDetailDto: UpdateProductDetailDto) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'update-product-detail' }, {
                product: productId,
                productDetail: productDetailId,
                ...updateProductDetailDto
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async deleteProductDetail(productId: string, productDetailId: string) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'delete-product-detail' }, {
                productId,
                productDetailId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    /* Highlighted Images (Product Details) */

    async getHighlightedImages(productId: string, productDetailId: string) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-highlighted-images' }, {
                productId,
                productDetailId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async createHighlightedImages(productId: string, productDetailId: string, images: Array<Express.Multer.File>) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'create-highlighted-images' }, {
                productId,
                productDetailId,
                images
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async updateHighlightedImages(
        productId: string, 
        productDetailId: string, 
        images?: Array<Express.Multer.File>,
        updatedImages?: string) {

        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'update-highlighted-images' }, {
                productId,
                productDetailId,
                images,
                updatedImages
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async deleteHighlightedImages(productId: string, productDetailId: string) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'delete-highlighted-images' }, {
                productId,
                productDetailId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }
}