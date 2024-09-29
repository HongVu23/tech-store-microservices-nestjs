import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateProductDto } from "./dtos/create-product.dto";
import { firstValueFrom } from "rxjs";

@Injectable()
export class CartService {

    constructor(@Inject('USER_SERVICE') private userServiceClient: ClientProxy) {}

    async getProducts(user: any) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-products-in-cart' }, user));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async createProduct(user: any, createProductDto: CreateProductDto) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'create-product-in-cart' }, {
                user,
                createProductDto
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async deleteProducts(user: any) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'delete-products-in-cart' }, user));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async getCartStatistics(user: any) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-cart-statistics' }, user));
            return respone; 
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async updateProduct(user: any, cartId: string, quantity: number) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'update-product-in-cart' }, {
                user,
                updateProductDto: {
                    cartId,
                    quantity
                }
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async deleteProduct(user: any, cartId: string) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'delete-product' }, {
                user,
                cartId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }
}