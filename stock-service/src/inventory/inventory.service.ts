import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Inventory } from "./schemas/inventory.schema";
import { Document, Model, Types } from "mongoose";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class InventoryService {

    constructor(
        @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
        @Inject('PRODUCT_SERVICE') private productServiceClient: ClientProxy
    ) { }

    async getProductInInventory(productId: Types.ObjectId): Promise<Inventory> {

        const inventory: Inventory = await this.inventoryModel.findOne({ product: productId }).lean().exec();

        if (!inventory) throw new RpcException({ message: 'Product not found in inventory', statusCode: HttpStatus.NOT_FOUND });

        return inventory;
    }

    async addProductToInventory(productId: Types.ObjectId, quantity: number): Promise<{ message: string }> {

        await this.inventoryModel.create({ product: productId, quantity: quantity });
        return { message: 'Add to inventory success' };
    }

    async updateProductQuantity(productId: Types.ObjectId, quantity: number): Promise<{ message: string }> {

        const inventory: Document<Types.ObjectId, any, Inventory> = await this.inventoryModel.findOne({ product: productId }).exec();

        // set quantity
        inventory.set('quantity', quantity);
        await inventory.save();
        return { message: 'Update success' };
    }

    async deleteProduct(productId: Types.ObjectId): Promise<{ message: string }> {

        const inventory: Document<Types.ObjectId, any, Inventory> = await this.inventoryModel.findOne({ product: productId }).exec();

        // delete
        await inventory.deleteOne();
        return { message: 'Delete success' };
    }

    async reduceProductQuantity(productId: Types.ObjectId, quantity: number): Promise<{ message: string }> {

        const inventory: Document<Types.ObjectId, any, Inventory> = await this.inventoryModel.findOne({ product: productId }).exec();

        if (!inventory) throw new RpcException({ message: 'Product not found in inventory', statusCode: HttpStatus.NOT_FOUND });

        const updatedQuantity: number = inventory.get('quantity') - quantity;

        // set product variant status to false if quantity equal to 0
        if (!updatedQuantity) {
            // get product variant
            let productVariant: any;
            try {
                productVariant = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product-variant-without-productid' }, productId));
            } catch (err) { throw new RpcException(err); }
            console.log('1')

            // update product variant status
            try {
                await firstValueFrom(this.productServiceClient.send({ cmd: 'update-product-variant' }, {
                    updateProductVariantDto: {
                        status: false,
                        productVariant: productVariant._id,
                        quantity: 0,
                        ...productVariant
                    }
                }));
            } catch (err) { throw new RpcException(err); }
            console.log('2')
        }

        // re-asign quantity
        inventory.set('quantity', updatedQuantity);
        await inventory.save();
        return { message: 'Reduce success' };
    }

    async getTotalProductsQuantity(): Promise<number> {

        // get total products quantity in inventory
        const sumInventQuantity: any = await this.inventoryModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalQuantity: {
                        $sum: '$quantity'
                    }
                }
            }
        ])

        const totalQuantityInInventory: number = sumInventQuantity[0].totalQuantity;

        return totalQuantityInInventory;
    }
}