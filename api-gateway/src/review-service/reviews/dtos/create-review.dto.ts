import { IsNotEmpty, IsNumberString, IsString } from "class-validator";

export class CreateReviewDto {

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsString()
    productId: string;

    @IsNotEmpty()
    @IsNumberString()
    ratingStar: string;
}