import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class OrderItemDto {

    @IsNotEmpty()
    @IsString()
    product: string;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;
}