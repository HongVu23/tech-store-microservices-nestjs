import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FavoriteProduct } from "./schemas/favorite-product.schema";
import { Document, Model, Types } from "mongoose";
import { User } from "src/interfaces/user.interface";
import { firstValueFrom } from "rxjs";
import { ClientProxy, RpcException } from "@nestjs/microservices";

@Injectable()
export class FavoriteProductsService {

    constructor(
        @InjectModel(FavoriteProduct.name) private favoriteProductModel: Model<FavoriteProduct>,
        @Inject('PRODUCT_SERVICE') private productServiceClient: ClientProxy
    ) { }

    async getFavoriteProducts(user: User): Promise<FavoriteProduct[]> {

        const favoriteProducts: FavoriteProduct[] = await this.favoriteProductModel.find({ user: new Types.ObjectId(user.id) }).lean().exec();

        for (const favoriteProduct of favoriteProducts) {
            // get product
            let product: any;
            try {
                product = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product' }, favoriteProduct.product));
            } catch (err) { throw new RpcException(err); }
            // asign product
            favoriteProduct.product = product;
        }

        return favoriteProducts;
    }

    async createFavoriteProduct(user: User, productId: string): Promise<{ message: string }> {

        if (!productId) throw new RpcException({ message: 'All fields are quired', statusCode: HttpStatus.BAD_REQUEST });

        // check whether product is exist or not
        try {
            await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product' }, productId));
        } catch (err) { throw new RpcException(err); }

        // check for duplicate product in favortie products
        const duplicateFavoriteProduct: FavoriteProduct = await this.favoriteProductModel.findOne({ product: new Types.ObjectId(productId) }).lean().exec();
        if (duplicateFavoriteProduct) throw new RpcException({ message: 'Duplicate favorite product', statusCode: HttpStatus.CONFLICT });

        await this.favoriteProductModel.create({
            user: new Types.ObjectId(user.id),
            product: new Types.ObjectId(productId)
        })

        return { message: 'Favorite product created' };
    }

    async deleteFavoriteProduct(user: User, favoriteProductId: string): Promise<{ message: string }> {

        // check whether favorite product is exist or not
        if (!Types.ObjectId.isValid(favoriteProductId)) throw new RpcException({ message: 'Favorite product not found', statusCode: HttpStatus.NOT_FOUND });

        const favoriteProduct: Document<Types.ObjectId, any, FavoriteProduct> = await this.favoriteProductModel.findOne({ _id: new Types.ObjectId(favoriteProductId) }).exec();

        if (!favoriteProduct) throw new RpcException({ message: 'Favorite product not found', statusCode: HttpStatus.NOT_FOUND });

        await favoriteProduct.deleteOne();
    
        return { message: 'Favorite product is deleted' };
    }
}