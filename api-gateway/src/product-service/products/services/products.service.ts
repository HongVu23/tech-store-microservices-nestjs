import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { CreateProductDto } from "../dtos/products/create-product.dto";
import { UpdateProductDto } from "../dtos/products/update-product.dto";

@Injectable()
export class ProductsService {

    constructor(@Inject('PRODUCT_SERVICE') private productServiceClient: ClientProxy) { }

    async getProducts(category?: string) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-products' }, category ? category : ''));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async createProduct(createProductDto: CreateProductDto) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'create-product' }, createProductDto));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async getFullProductsInfos(category?: string) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-full-products-infos' }, category ? category : ''));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async searchProductForAdmin(text: string) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'search-product-for-admin' }, text ? text: ''));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async searchProduct(text: string) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'search-product' }, text ? text: ''));
            return respone;
        } catch(err) { throw new HttpException(err.message, err.statusCode); }
    }

    async updateProduct(productId: string, updateProductDto: UpdateProductDto) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'update-product' }, { productId, updateProductDto }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async deleteProduct(productId: string) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'delete-product' }, productId));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async getProduct(productId: string) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product' }, productId));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode) };
    }

    async getFullProductInfos(productId: string) {
        try {
            const respone = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-full-product-infos' }, productId));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }
}