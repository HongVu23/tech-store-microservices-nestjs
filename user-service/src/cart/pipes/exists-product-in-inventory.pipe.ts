import { HttpStatus, Inject, PipeTransform } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { Types } from "mongoose";
import { firstValueFrom } from "rxjs";

export class ExistsProductInInventory implements PipeTransform<any, Promise<any>> {

    constructor(@Inject('STOCK_SERVICE') private stockServiceClient: ClientProxy) { }

    async transform(dto: any): Promise<any> {

        const { productId } = dto;

        if (!Types.ObjectId.isValid(productId)) throw new RpcException({ message: 'Product not found in inventory', statusCode: HttpStatus.NOT_FOUND });

        // get product in inventory
        let inventory: any;
        try {
            inventory = await firstValueFrom(this.stockServiceClient.send({ cmd: 'get-product-in-inventory' }, productId));
        } catch (err) { throw new RpcException(err); }

        return { inventory, dto };
    }
}