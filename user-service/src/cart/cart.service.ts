import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cart } from "./schemas/cart.schema";
import { Document, FlattenMaps, Model, Types } from "mongoose";
import { CreateProductDto } from "./dtos/create-product.dto";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { User } from "src/interfaces/user.interface";
import { firstValueFrom } from "rxjs";
import { UpdateProductDto } from "./dtos/update-product.dto";

@Injectable()
export class CartService {

    constructor(
        @InjectModel(Cart.name) private cartModel: Model<Cart>,
        @Inject('PRODUCT_SERVICE') private productServiceClient: ClientProxy,
        @Inject('STOCK_SERVICE') private stockServiceClient: ClientProxy
    ) { }

    async getProducts(user: User): Promise<(FlattenMaps<Cart> & { _id: Types.ObjectId })[]> {

        const products: (FlattenMaps<Cart> & { _id: Types.ObjectId })[] = await this.cartModel.find({ user: new Types.ObjectId(user.id) }).select('-user').lean().exec();

        // if (!products.length) throw new RpcException({ message: 'Cart is empty', statusCode: HttpStatus.NOT_FOUND });
        if (!products.length) return [];

        // join name and brand
        for (const product of products) {
            // get product variant info
            let productVariant: any;
            try {
                productVariant = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-populated-product-variant-without-productid' }, product.product));
            } catch (err) {
                throw new RpcException(err);
            }

            product.product = productVariant;
        }

        return products;
    }

    async createProduct(user: User, createProductDto: CreateProductDto): Promise<{ message: string }> {
        // check whether it's already exist in user cart or not
        const productCart: Document<Types.ObjectId, any, Cart> = await this.cartModel.findOne({ product: new Types.ObjectId(createProductDto.productId) }).exec();

        if (!productCart) {
            await this.cartModel.create({
                user: new Types.ObjectId(user.id),
                product: new Types.ObjectId(createProductDto.productId),
                quantity: createProductDto.quantity
            });
        } else {
            const updatedQuantity: number = productCart.get('quantity') + createProductDto.quantity;
            if (updatedQuantity > createProductDto.inventory.quantity) {
                throw new RpcException({ message: 'Imvalid quantity of product. Quantity is larger than inventory', statusCode: HttpStatus.BAD_REQUEST });
            }

            productCart.set('quantity', updatedQuantity);
            await productCart.save();
        }

        return { message: 'Product added to cart' };
    }

    async deleteProducts(user: User): Promise<{ message: string }> {

        // check whether cart is empty or not
        const products: Cart[] = await this.cartModel.find({ user: new Types.ObjectId(user.id) }).lean().exec();

        if (!products.length) throw new RpcException({ message: 'Cart is empty', statusCode: HttpStatus.NOT_FOUND });

        await this.cartModel.deleteMany({ user: new Types.ObjectId(user.id) });

        return { message: 'Products is delete' };
    }

    async getCartStatistics(user: User): Promise<any> {

        const products: (FlattenMaps<Cart> & { _id: Types.ObjectId })[] = await this.cartModel.find({ user: new Types.ObjectId(user.id) }).lean().exec();

        // total quantity
        let totalQuanity: number = 0;
        let totalPrice: number = 0;

        for (const product of products) {
            // get product variant
            let productVariant: any;
            try {
                productVariant = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product-variant-without-productid' }, product.product));
            } catch (err) { throw new RpcException(err); }

            totalQuanity += product.quantity;
            totalPrice += product.quantity * productVariant.price;
        }

        const statistics = { totalQuanity, totalPrice }
        return statistics;
    }

    async updateProduct(user: User, updateProductDto: UpdateProductDto) {

        if (!updateProductDto.quantity) throw new RpcException({ message: 'All fields required', statusCode: HttpStatus.BAD_REQUEST });

        // check whether product is exist in inventory or not
        let inventory: any; 
        try {
            inventory = await firstValueFrom(this.stockServiceClient.send({ cmd: 'get-product-in-inventory' }, updateProductDto.productCart.get('product')));
        } catch (err) { throw new RpcException(err); }

        if (inventory.quantity < updateProductDto.quantity) {
            throw new RpcException({ message: 'Imvalid quantity of product. Quantity is larger than inventory', statusCode: HttpStatus.BAD_REQUEST });
        }

        updateProductDto.productCart.set('quantity', updateProductDto.quantity);
        await updateProductDto.productCart.save();
        return { message: 'Product updated' };
    }

    async deleteProduct(user: User, cartId: string): Promise<{ message: string }> {
        // check whether cart id is exist or not
        if (!Types.ObjectId.isValid(cartId)) throw new RpcException({ message: 'Product not found in cart', statusCode: HttpStatus.NOT_FOUND });

        const productCart: Document<Types.ObjectId, any, Cart> = await this.cartModel.findOne({ _id: new Types.ObjectId(cartId) }).exec();

        if (!productCart) throw new RpcException({ message: 'Product not found in cart', statusCode: HttpStatus.NOT_FOUND });

        await productCart.deleteOne();
    
        return { message: 'Product is deleted' };
    }
}