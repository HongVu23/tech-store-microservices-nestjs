import { HttpStatus, PipeTransform } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Review } from "../schemas/review.schema";
import { Document, Model, Types } from "mongoose";
import { RpcException } from "@nestjs/microservices";

export class ExistsReviewPipe implements PipeTransform<string, Promise<Document<Types.ObjectId, any, Review>>> {

    constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

    async transform(reviewId: string): Promise<Document<Types.ObjectId, any, Review>> {
        
        if (!Types.ObjectId.isValid(reviewId)) {
            throw new RpcException({ message: 'Review not found', statusCode: HttpStatus.NOT_FOUND });
        }

        const review: Document<Types.ObjectId, any, Review> = await this.reviewModel.findOne({ _id: new Types.ObjectId(reviewId) }).exec();

        if (!review) {
            throw new RpcException({ message: 'Review not found', statusCode: HttpStatus.NOT_FOUND });
        }

        return review;
    }
}