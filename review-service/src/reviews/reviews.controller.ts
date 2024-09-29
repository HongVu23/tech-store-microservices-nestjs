import { Controller, UseFilters } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AllExceptionsFilter } from "src/filters/all-exceptions.filter";
import { User } from "src/interfaces/user.interface";
import { CreateReviewDto } from "./dtos/create-review.dto";
import { ExistsProductPipe } from "./pipes/exists-product.pipe";
import { Review } from "./schemas/review.schema";
import { Document, Types } from "mongoose";
import { UpdateReviewDto } from "./dtos/update-review.dto";
import { ExistsReviewPipe } from "./pipes/exists-review.pipe";

@Controller()
@UseFilters(AllExceptionsFilter)
export class ReviewsController {

    constructor(private reviewsService: ReviewsService) {}

    @MessagePattern({ cmd: 'get-reviews' })
    getReviews(@Payload() productId: string): Promise<Review[]> {
        return this.reviewsService.getReviews(productId);
    }

    @MessagePattern({ cmd: 'create-review' })
    createReview(
        @Payload('user') user: User,
        @Payload('createReviewDto', ExistsProductPipe) createReviewdDto: CreateReviewDto,
        @Payload('images') images?: Array<Express.Multer.File>): Promise<{ message: string }> {

        return this.reviewsService.createReview(user, createReviewdDto, images);
    }

    @MessagePattern({ cmd: 'get-star-rating-statistics' })
    getStarRatingStatistics(@Payload() productId: string)  {
        return this.reviewsService.getStarRatingStatistics(productId);
    }

    @MessagePattern({ cmd: 'get-overall-star-rating-statistics' })
    getOverallStarRatingStatistics(@Payload() productId: string) {
        return this.reviewsService.getOverallStarRatingStatistics(productId);
    }

    @MessagePattern({ cmd: 'update-review' })
    updateReview(
        @Payload('user') user: User,
        @Payload('reviewId', ExistsReviewPipe) review: Document<Types.ObjectId, any, Review>,
        @Payload('updateReviewDto') updateReviewDto: UpdateReviewDto,
        @Payload('images') images?: Array<Express.Multer.File>): Promise<{ message: string }> {

        return this.reviewsService.updateReview(user, review, updateReviewDto, images);
    }

    @MessagePattern({ cmd: 'delete-review' })
    deleteReview(
        @Payload('user') user: User, 
        @Payload('reviewId', ExistsReviewPipe) review: Document<Types.ObjectId, any, Review>): Promise<{ message: string }> {

        return this.reviewsService.deleteReview(user, review);
    }
}