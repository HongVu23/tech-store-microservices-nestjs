import { HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class FavoriteProductsService {

    constructor(@Inject('USER_SERVICE') private userServiceClient: ClientProxy) {}

    async getFavoriteProducts(user: any) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-favorite-products' }, user));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async createFavoriteProduct(user: any, productId: string) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'create-favorite-product' }, {
                user,
                productId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async deleteFavoriteProduct(user: any, favoriteProductId: string) {
        try {
            const respone = await firstValueFrom(this.userServiceClient.send({ cmd: 'delete-favorite-product' }, {
                user,
                favoriteProductId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }
}