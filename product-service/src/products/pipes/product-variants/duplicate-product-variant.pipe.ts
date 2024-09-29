import { HttpStatus, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { FlattenMaps, Model, Types } from "mongoose";
import { ProductVariant } from "src/products/schemas/product-variant.schema";
import { generateDuplicateFields } from "src/products/utils/duplicate-fields.util";

export class DuplicateProductVariantPipe implements PipeTransform<any, Promise<any>> {

    constructor(@InjectModel(ProductVariant.name) private productVariantModel: Model<ProductVariant>) {}

    async transform(payload: any): Promise<any> {
        
        const { foundProduct, dto } = payload;

        const category: string = foundProduct.category;

        const duplicateFields: string[] = generateDuplicateFields(category);

        const queryObject: Record<string, any> = {};
        queryObject.product = foundProduct._id;

        for (const duplicateField of duplicateFields) {
            queryObject[duplicateField] = dto[duplicateField];
        }

        // check for duplicate for update product variant
        if (dto.productVariantObj) {
            
            // find all product variant object has duplicate fields
            const productVariants: (FlattenMaps<ProductVariant> & { _id: Types.ObjectId })[] = await this.productVariantModel.find({ product: foundProduct._id }).lean().exec();

            for (const productVariant of productVariants) {
                if (productVariant._id.toString() === dto.productVariantObj._id.toString()) {
                    continue;
                }

                let isUpdateDuplicate: boolean = true;
                // check for duplicate
                for (const duplicateField of duplicateFields) {
                    if (productVariant[duplicateField] !== dto[duplicateField]) isUpdateDuplicate = false;
                }

                if (isUpdateDuplicate) throw new RpcException({ message: 'Duplicate product variant', statusCode: HttpStatus.CONFLICT });
            }
        } else {

            const duplicate: ProductVariant = await this.productVariantModel.findOne(queryObject).lean().exec();
            if (duplicate) throw new RpcException({ message: 'Duplicate product variant', statusCode: HttpStatus.CONFLICT });
        }

        return dto;
    }
}