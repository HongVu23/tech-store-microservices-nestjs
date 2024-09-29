import { Inject, PipeTransform } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

export class ExistsProductPipe implements PipeTransform<any, Promise<any>> {

    constructor(@Inject('PRODUCT_SERVICE') private productServiceClient: ClientProxy) {}

    async transform(dto: any): Promise<any> {
        
        const { productId } = dto;

        try {
            await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product' }, productId));
        } catch (err) { throw new RpcException(err); }

        return dto;
    }
}