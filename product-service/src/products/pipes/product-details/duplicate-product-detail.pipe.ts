import { HttpStatus, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ProductDetail } from "src/products/schemas/product-detail.schema";

export class DuplicateProductDetailPipe implements PipeTransform<any, Promise<any>> {

    constructor(@InjectModel(ProductDetail.name) private productDetailModel: Model<ProductDetail>) {}

    async transform(payload: any): Promise<any> {

        const { dto } = payload;
        const productId: Types.ObjectId = new Types.ObjectId(dto.product);
        
        const duplicate: ProductDetail = await this.productDetailModel.findOne({ product: productId }).lean().exec();

        if (duplicate) {
            throw new RpcException({ message: 'Duplicate product detail', statusCode: HttpStatus.CONFLICT });
        }

        return payload;
    }
}