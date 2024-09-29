import { HttpStatus, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Product } from "src/products/schemas/product.schema";

export class ExistsProductPipe implements PipeTransform<any, Promise<any>> {

    constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

    async transform(dto: any): Promise<any> {
        
        const { product } = dto;

        if (!Types.ObjectId.isValid(product)) {
            throw new RpcException({ message: 'Product not found', statusCode: HttpStatus.NOT_FOUND });
        }

        const foundProduct: Product = await this.productModel.findOne({ _id: product }).lean().exec();

        if (!foundProduct) throw new RpcException({ message: 'Product not found', statusCode: HttpStatus.NOT_FOUND });

        return { foundProduct, dto };
    }
}