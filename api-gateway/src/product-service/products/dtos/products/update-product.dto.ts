import { IsNotEmpty, IsString } from "class-validator";

export class UpdateProductDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    brand: string;
}