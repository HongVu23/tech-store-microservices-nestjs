import { Inject, PipeTransform } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

export class ExistsProductPipe implements PipeTransform<any, Promise<any>> {

    constructor(@Inject('PRODUCT_SERVICE') private productServiceClient: ClientProxy) {}

    async transform(dto: any): Promise<any> {
        
        const { productId } = dto;

        let product: any;
        try {
            product = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product' }, productId));
        } catch (err) { throw new RpcException(err); }

        // asign product to product of dto
        dto.product = product;

        return dto;
    }
}