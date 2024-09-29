import { IsBooleanString, IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";

export class UpdateProductVariantDto {

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
    @IsBooleanString()
    status: string;

    @IsNotEmpty()
    @IsNumberString()
    quantity: string;
}