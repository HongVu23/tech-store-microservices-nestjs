import { HttpStatus, PipeTransform } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import { Product } from "../../schemas/product.schema";
import { RpcException } from "@nestjs/microservices";

export class ParseProductPipe implements PipeTransform<Types.ObjectId, Promise<Document<Types.ObjectId, any, Product>>> {

    constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

    async transform(productId: Types.ObjectId): Promise<Document<Types.ObjectId, any, Product>> {
        
        const product: Document<Types.ObjectId, any, Product> = await this.productModel.findOne({ _id: productId }).exec();

        if (!product) throw new RpcException({ message: 'Product not found', statusCode: HttpStatus.NOT_FOUND });

        return product;
    }
}