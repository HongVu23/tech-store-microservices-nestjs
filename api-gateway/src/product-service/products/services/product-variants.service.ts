import { HttpException, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateProductVariantDto } from "../dtos/product-variants/create-product-variant.dto";
import { firstValueFrom } from "rxjs";
import { UpdateProductVariantDto } from "../dtos/product-variants/update-product-variant.dto";

export class ProductVariansService {

    constructor(@Inject('PRODUCT_SERVICE') private productServiceCLient: ClientProxy) {}

    async getProductVariants(productId: string) {
        try {
            const respone = await firstValueFrom(this.productServiceCLient.send({ cmd: 'get-product-variants' }, productId));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async createProductVariant(productId: string, createProductVariantDto: CreateProductVariantDto, image?: Express.Multer.File) {
        try {
            const respone = await firstValueFrom(this.productServiceCLient.send(
                { cmd: 'create-product-variant' }, 
                { 
                    createProductVariantDto: { 
                        product: productId, 
                        ...createProductVariantDto 
                    }, 
                    image 
                }
            ));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async updateProductVariant(productId: string, productVariantId: string, updateProductVariantDto: UpdateProductVariantDto, image?: Express.Multer.File) {
        try {
            const respone = await firstValueFrom(this.productServiceCLient.send(
                { cmd: 'update-product-variant' },
                {
                    updateProductVariantDto: {
                        product: productId,
                        productVariant: productVariantId,
                        ...updateProductVariantDto
                    },
                    image
                }
            ));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async deleteProductVariant(productId: string, productVariantId: string) {
        try {
            const respone = await firstValueFrom(this.productServiceCLient.send({ cmd: 'delete-product-variant' }, {
                productId,
                productVariantId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async getProductVariant(productId: string, productVariantId: string) {
        try {
            const respone = await firstValueFrom(this.productServiceCLient.send({ cmd: 'get-product-variant' }, {
                productId,
                productVariantId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }
}