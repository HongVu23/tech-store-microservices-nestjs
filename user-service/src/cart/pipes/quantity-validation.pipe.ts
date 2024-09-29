import { HttpStatus, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

export class QuantityValidationPipe implements PipeTransform<any, any> {

    transform(payload: any): any {
        
        const { inventory, dto } = payload;

        if (inventory.quantity < dto.quantity) {
            throw new RpcException({ message: 'Imvalid quantity of product. Quantity is larger than inventory', statusCode: HttpStatus.BAD_REQUEST });
        }

        // asign inventory to dto
        dto.inventory = inventory;

        return dto;
    }
}