import { HttpStatus, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

export class DiscountValidationPipe implements PipeTransform<any, any> {

    transform(payload: any): any {

        const { dto } = payload;

        // check whether discount is valid or not
        let tmpDiscount: any;
        if (typeof dto.discount !== 'object') {
            tmpDiscount = JSON.parse(dto.discount);
        } else {
            tmpDiscount = dto.discount;
        }

        // check whether discountPercentage = 0 or not. If equal to 0 then check whether has discountEndDate from discount
        if (tmpDiscount.discountPercentage === 0) {

            if (tmpDiscount.discountEndDate) {
                throw new RpcException({ message: 'Discount end time not allowed when discount percentage is 0', statusCode: HttpStatus.BAD_REQUEST });
            }
        } else {

            if (!tmpDiscount.discountEndDate) {
                throw new RpcException({ message: 'Discount end time is required', statusCode: HttpStatus.BAD_REQUEST });
            }

            // if (new Date() > tmpDiscount.discountEndDate) {
            //     throw new RpcException({ message: 'Discount end time must be in the future', statusCode: HttpStatus.BAD_REQUEST });
            // }
            if (new Date() > new Date(tmpDiscount.discountEndDate)) {
                throw new RpcException({ message: 'Discount end time must be in the future', statusCode: HttpStatus.BAD_REQUEST });
            }
        }

        return payload;
    }
}