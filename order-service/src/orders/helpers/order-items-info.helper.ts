import { ClientProxy, RpcException } from "@nestjs/microservices";
import { Order } from "../schemas/order.schema";
import { firstValueFrom } from "rxjs";

// get order items info
export const getOrderItemsInfo = async (orders: Order[], productServiceClient: ClientProxy): Promise<Order[]> => {

    for (const order of orders) {
        const { orderItems } = order;

        for (const orderItem of orderItems) {
            // get populated product variant
            let productVariant: any;
            try {
                productVariant = await firstValueFrom(productServiceClient.send({ cmd: 'get-populated-product-variant-without-productid' }, orderItem.product));
            } catch (err) { throw new RpcException(err); }

            // asign populated product variant to order item
            orderItem.product = productVariant;
        }
    }

    return orders;
}