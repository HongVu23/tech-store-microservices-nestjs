import { Types } from "mongoose";

export class CreateCommentDto {

    productId: Types.ObjectId;

    content: string;
}