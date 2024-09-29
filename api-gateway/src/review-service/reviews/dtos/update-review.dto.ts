import { IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";

export class UpdateReviewDto {

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsNumberString()
    ratingStar: string;

    @IsOptional()
    @IsString()
    updatedImages?: string;
}