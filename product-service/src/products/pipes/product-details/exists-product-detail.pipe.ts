import { HttpStatus, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import { ProductDetail } from "src/products/schemas/product-detail.schema";

export class ExistsProductDetailPipe implements PipeTransform<any, Promise<any>> {

    constructor(@InjectModel(ProductDetail.name) private productDetailModel: Model<ProductDetail>) {}

    async transform(payload: any): Promise<any> {
        
        const { dto } = payload;
        const productDetail = dto.productDetail;

        if (!Types.ObjectId.isValid(productDetail)) {
            throw new RpcException({ message: 'Product detail not found', statusCode: HttpStatus.NOT_FOUND });
        }

        const productDetailObj: Document<Types.ObjectId, any, ProductDetail> = await this.productDetailModel.findOne({ _id: productDetail }).exec();

        if (!productDetailObj) {
            throw new RpcException({ message: 'Product detail not found', statusCode: HttpStatus.NOT_FOUND });
        }

        // asign product detail object
        dto.productDetailObj = productDetailObj;

        return payload;
    }
}