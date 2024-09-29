import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Category } from "../../enums/category.enum";

export class CreateProductDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    brand: string;

    @IsNotEmpty()
    @IsEnum(Category)
    category: Category;
}