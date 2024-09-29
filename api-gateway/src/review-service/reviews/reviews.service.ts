import { BadRequestException, HttpException, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateReviewDto } from "./dtos/create-review.dto";
import { firstValueFrom } from "rxjs";
import { UpdateReviewDto } from "./dtos/update-review.dto";

@Injectable()
export class ReviewsService {
    
    constructor(@Inject('REVIEW_SERVICE') private reviewServiceClient: ClientProxy) {}

    async getReviews(productId: string) {

        if (!productId) throw new BadRequestException('Product id is required');

        try {
            const respone = await firstValueFrom(this.reviewServiceClient.send({ cmd: 'get-reviews' }, productId));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async createReview(user: any, createReviewDto: CreateReviewDto, images?: Array<Express.Multer.File>) {
        try {
            const respone = await firstValueFrom(this.reviewServiceClient.send({ cmd: 'create-review' }, {
                user,
                createReviewDto,
                images
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async getRatingStarStatistics(productId: string) {
        if (!productId) throw new BadRequestException('Product id is required');
        try {
            const respone = await firstValueFrom(this.reviewServiceClient.send({ cmd: 'get-star-rating-statistics' }, productId));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async updateReview(user: any, reviewId: string, updateReviewDto: UpdateReviewDto, images?: Array<Express.Multer.File>) {
        try {
            const respone = await firstValueFrom(this.reviewServiceClient.send({ cmd: 'update-review' }, {
                user,
                reviewId,
                updateReviewDto,
                images
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }

    async deleteReview(user: any, reviewId: string) {
        try {
            const respone = await firstValueFrom(this.reviewServiceClient.send({ cmd: 'delete-review' }, {
                user,
                reviewId
            }));
            return respone;
        } catch (err) { throw new HttpException(err.message, err.statusCode); }
    }
}