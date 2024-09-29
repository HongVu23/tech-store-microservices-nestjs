import { Types } from "mongoose";

export class CreateReviewDto {

    content: string;

    productId: Types.ObjectId;

    ratingStar: string;

    product: any;
}