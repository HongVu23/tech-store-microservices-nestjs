import { HttpStatus, PipeTransform } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { generateVariantRequiredFields } from "src/products/utils/required-fields.util";

export class RequiredFieldsValidationPipe implements PipeTransform<any, any> {

    transform(payload: any): any {
        
        const { foundProduct, dto } = payload;

        const requiredFields: string[] = generateVariantRequiredFields(foundProduct.category);

        for (const requiredField of requiredFields) {
            if (!dto[requiredField]) throw new RpcException({ message: 'All fields required', statusCode: HttpStatus.BAD_REQUEST });
        }

        return payload;
    }
}