import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import { ImportedProduct } from "./schemas/imported-product.schema";

@Injectable()
export class ImportedProductsService {

    constructor(@InjectModel(ImportedProduct.name) private importedProductModel: Model<ImportedProduct>) {}

    async addProductToImportedProducts(productId: Types.ObjectId, quantity: number): Promise<{ message: string }> {

        await this.importedProductModel.create({ product: productId, quantity: quantity });
        return { message: 'Add product to imported products success' };
    }

    async updateProductQuantity(productId: Types.ObjectId, quantity: number): Promise<{ message: string }> {

        const importedProduct: Document<Types.ObjectId, any, ImportedProduct> = await this.importedProductModel.findOne({ product: productId }).exec();

        // set quantity
        importedProduct.set('quantity', quantity);
        await importedProduct.save();
        return { message: 'Update success' };
    }

    async deleteProduct(productId: Types.ObjectId): Promise<{ message: string }> {

        const importedProduct: Document<Types.ObjectId, any, ImportedProduct> = await this.importedProductModel.findOne({ product: productId }).exec();

        // delete
        await importedProduct.deleteOne();
        return { message: 'Delete success' };
    }
}