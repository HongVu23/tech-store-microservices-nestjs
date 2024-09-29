import { HttpStatus, PipeTransform } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product } from "../../schemas/product.schema";
import { Model } from "mongoose";
import { CreateProductDto } from "../../dtos/products/create-product.dto";
import { RpcException } from "@nestjs/microservices";

export class DuplicateProductPipe implements PipeTransform<CreateProductDto, Promise<CreateProductDto>> {

    constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

    async transform(createProductDto: CreateProductDto): Promise<CreateProductDto> {

        const duplicate: Product = await this.productModel.findOne({ 
            name: createProductDto.name, 
            category: createProductDto.category 
        }).lean().exec();

        if (duplicate) throw new RpcException({ message: 'Duplicate product', statusCode: HttpStatus.CONFLICT });

        return createProductDto;
    }
}