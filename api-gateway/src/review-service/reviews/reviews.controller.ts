import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Patch, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { AuthGuard } from "src/auth-service/auth/guards/auth.guard";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CreateReviewDto } from "./dtos/create-review.dto";
import { UpdateReviewDto } from "./dtos/update-review.dto";

@Controller('reviews')
export class ReviewsController {

    constructor(private reviewsService: ReviewsService) {}

    @Get()
    getReviews(@Query('productId') productId: string) {
        return this.reviewsService.getReviews(productId);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('images'))
    @UsePipes(ValidationPipe)
    createReview(
        @Req() req: any,
        @Body() createReviewDto: CreateReviewDto,
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: 'jpeg|jpg|png'
                })
                .addMaxSizeValidator({
                    maxSize: 5 * 1024 * 1024 // 5MB
                })
                .build({
                    fileIsRequired: false,
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) images?: Array<Express.Multer.File>) {

        return this.reviewsService.createReview(req.user, createReviewDto, images);
    }

    @Get('ratingStatistics')
    getRatingStarStatistics(@Query('productId') productId: string) {
        return this.reviewsService.getRatingStarStatistics(productId);
    }

    @Patch(':reviewId')
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('images'))
    @UsePipes(ValidationPipe)
    updateReview(
        @Req() req: any,
        @Param('reviewId') reviewId: string,
        @Body(ValidationPipe) updateReviewDto: UpdateReviewDto,
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: 'jpeg|jpg|png'
                })
                .addMaxSizeValidator({
                    maxSize: 5 * 1024 * 1024 // 5MB
                })
                .build({
                    fileIsRequired: false,
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                })
        ) images?: Array<Express.Multer.File>) {

        return this.reviewsService.updateReview(req.user, reviewId, updateReviewDto, images);
    }

    @Delete(':reviewId')
    @UseGuards(AuthGuard)
    deleteReview(@Req() req: any, @Param('reviewId') reviewId: string) {
        return this.reviewsService.deleteReview(req.user, reviewId);
    }
}