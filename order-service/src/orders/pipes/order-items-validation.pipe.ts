import { HttpStatus, Inject, PipeTransform } from "@nestjs/common";
import { CreateOrderDto } from "../dtos/create-order.dto";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { Types } from "mongoose";
import { firstValueFrom } from "rxjs";

export class OrderItemsValidationPipe implements PipeTransform<CreateOrderDto, Promise<CreateOrderDto>> {

    constructor(@Inject('STOCK_SERVICE') private stockServiceCLient: ClientProxy) {}

    async transform(createOrderDto: CreateOrderDto): Promise<CreateOrderDto> {

        const { orderItems } = createOrderDto;

        if (!orderItems.length) throw new RpcException({ message: 'Order items is required', statusCode: HttpStatus.BAD_REQUEST });

        for (const orderItem of orderItems) {
            
            if (!Types.ObjectId.isValid(orderItem.product)) {
                throw new RpcException({ message: 'Order item not found' });
            }

            // check order item is exist in inventory and whether quantity is valid or not
            const inventory: any = await firstValueFrom(this.stockServiceCLient.send({ cmd: 'get-product-in-inventory' }, orderItem.product));
            
            if (orderItem.quantity > inventory.quantity) {
                throw new RpcException({
                    message: `Invalid quantity for order item(${orderItem.product}). Quantiy is larger than in inventory`,
                    statusCode: HttpStatus.BAD_REQUEST
                })
            }
        }

        return createOrderDto;
    }
}