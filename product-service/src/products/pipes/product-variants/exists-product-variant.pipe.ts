import { HttpStatus, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import { ProductVariant } from "src/products/schemas/product-variant.schema";

export class ExistsProductVariantPipe implements PipeTransform<any, Promise<any>> {

    constructor(@InjectModel(ProductVariant.name) private productVariantModel: Model<ProductVariant>) {}

    async transform(payload: any): Promise<any> {
        
        const { dto } = payload;
        const { productVariant } = dto;

        if (!Types.ObjectId.isValid(productVariant)) {
            throw new RpcException({ message: 'Product variant not found', statusCode: HttpStatus.NOT_FOUND });
        }

        const productVariantObj: Document<Types.ObjectId, any, ProductVariant> = await this.productVariantModel.findOne({ _id: productVariant }).exec();

        if (!productVariantObj) {
            throw new RpcException({ message: 'Product variant not found', statusCode: HttpStatus.NOT_FOUND });
        }

        // asign productVariantObj to dto
        dto.productVariantObj = productVariantObj;

        return payload;
    }
}