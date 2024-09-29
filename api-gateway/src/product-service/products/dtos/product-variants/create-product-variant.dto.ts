import { IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";

export class CreateProductVariantDto {

    @IsOptional()
    @IsString()
    ram?: string;

    @IsOptional()
    @IsString()
    hardDrive?: string;

    @IsOptional()
    @IsString()
    rom?: string;

    @IsNotEmpty()
    @IsString()
    color: string;

    @IsNotEmpty()
    @IsNumberString()
    price: string;

    @IsNotEmpty()
    discount: Record<string, any>;

    @IsNotEmpty()
    @IsNumberString()
    quantity: string;
}