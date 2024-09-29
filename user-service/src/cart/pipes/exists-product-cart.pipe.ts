import { HttpStatus, PipeTransform } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cart } from "../schemas/cart.schema";
import { Document, Model, Types } from "mongoose";
import { RpcException } from "@nestjs/microservices";

export class ExistsProductCart implements PipeTransform<any, Promise<any>> {

    constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) {}

    async transform(dto: any): Promise<any> {
        
        const { cartId } = dto;

        const productCart: Document<Types.ObjectId, any, Cart> = await this.cartModel.findOne({ _id: new Types.ObjectId(cartId) }).exec();

        if (!productCart) throw new RpcException({ message: 'Product not found in cart', statusCode: HttpStatus.NOT_FOUND });

        dto.productCart = productCart;

        return dto;
    }
}