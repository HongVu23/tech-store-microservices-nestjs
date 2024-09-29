import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Review } from "./schemas/review.schema";
import { Document, Model, Types } from "mongoose";
import { User } from "src/interfaces/user.interface";
import { CreateReviewDto } from "./dtos/create-review.dto";
import { ConfigService } from "@nestjs/config";
import { pluralizeProductName, standardizeFolderNames } from "src/utils/standardize-names.util";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { UpdateReviewDto } from "./dtos/update-review.dto";
import { isValidUpdatedImages } from "./helpers/highlighted-images-validation.helper";
import { getRatingStarStatisticsHelper } from "./helpers/rating-statistics.helper";

@Injectable()
export class ReviewsService {

    constructor(
        @InjectModel(Review.name) private reviewModel: Model<Review>,
        @Inject('IMAGE_SERVICE') private imageServiceClient: ClientProxy,
        @Inject('PRODUCT_SERVICE') private productServiceClient: ClientProxy,
        @Inject('USER_SERVICE') private userServiceClient: ClientProxy,
        private configService: ConfigService
    ) { }

    async getReviews(productId: string): Promise<Review[]> {

        // check whether product id is exist or not
        try {
            await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product' }, productId));
        } catch (err) { throw new RpcException(err); }

        const reviews: Review[] = await this.reviewModel.find({ product: new Types.ObjectId(productId) }).lean().exec();

        for (const review of reviews) {
            // asign user
            let user: any;
            try {
                user = await firstValueFrom(this.userServiceClient.send({ cmd: 'get-user' }, review.user));
            } catch (err) { throw new RpcException(err); }
            review.user = user;
        }

        return reviews;
    }

    async createReview(user: User, createReviewDto: CreateReviewDto, images?: Array<Express.Multer.File>): Promise<{ message: string }> {

        // get category and name
        const category: string = pluralizeProductName(createReviewDto.product.category);
        const name: string = createReviewDto.product.name;

        let imagesArray: Record<string, any>[] = [];

        if (images) {
            // save images
            let savedImages: string[];
            try {
                savedImages = await firstValueFrom(this.imageServiceClient.send({ cmd: 'save-product-review-images' }, {
                    category,
                    name,
                    images
                }));
            } catch (err) { throw new RpcException(err); }

            imagesArray = savedImages.map(savedImage =>
            ({
                imageName: savedImage,
                imageUrl: `${this.configService.get<string>('SERVER_URL')}/products/${category.toLowerCase()}/${standardizeFolderNames(name)}/review-images/${savedImage}`
            })
            )
        }

        try {
            await this.reviewModel.create({
                content: createReviewDto.content,
                user: new Types.ObjectId(user.id),
                product: new Types.ObjectId(createReviewDto.productId),
                images: imagesArray,
                ratingStar: createReviewDto.ratingStar
            })
        } catch (err) {
            // rollback images
            if (images) {
                try {
                    await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-review-images-folder' }, {
                        category,
                        name
                    }));
                } catch (err) { throw new RpcException(err); }
            }
            throw new RpcException(err);
        }

        return { message: 'Review is created' };
    }

    async getStarRatingStatistics(productId: string) {

        // check whether product is exist or not
        try {
            await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product' }, productId));
        } catch (err) { throw new RpcException(err); }

        const servedStatisticsResult = await getRatingStarStatisticsHelper(new Types.ObjectId(productId), this.reviewModel);
    
        if (!servedStatisticsResult.isValid) {
            return {
                stars: [
                    {
                        star: 1,
                        count: 0,
                        statisticalPercentage: 0
                    },
                    {
                        star: 2,
                        count: 0,
                        statisticalPercentage: 0
                    },
                    {
                        star: 3,
                        count: 0,
                        statisticalPercentage: 0
                    },
                    {
                        star: 4,
                        count: 0,
                        statisticalPercentage: 0
                    },
                    {
                        star: 5,
                        count: 0,
                        statisticalPercentage: 0
                    }
                ],
                totalStars: 0,
                averageRating: 0
            }
        }

        return servedStatisticsResult.data;
    }

    async getOverallStarRatingStatistics(productId: string) {

        // check whether product is exist or not
        try {
            await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product' }, productId));
        } catch (err) { throw new RpcException(err); }

        const servedStatisticsResult = await getRatingStarStatisticsHelper(new Types.ObjectId(productId), this.reviewModel);
    
        if (!servedStatisticsResult.isValid) {
            return { totalStars: 0, averageRating: 0 };
        }

        // delete stars property
        delete servedStatisticsResult.data.stars;

        return servedStatisticsResult.data;
    }

    async updateReview(
        user: User,
        review: Document<Types.ObjectId, any, Review>,
        updateReviewDto: UpdateReviewDto,
        images?: Array<Express.Multer.File>): Promise<{ message: string }> {

        // check for valid user
        if (user.id.toString() !== review.get('user').toString()) throw new RpcException({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });

        // check whether updatedImages is valid or not
        if (updateReviewDto.updatedImages) {
            const isValid = isValidUpdatedImages(review, updateReviewDto.updatedImages as unknown as Record<string, string>[]);
            if (!isValid) throw new RpcException(isValid.error);
        }

        // get product
        let product: any;
        try {
            product = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product' }, review.get('product')));
        } catch (err) { throw new RpcException(err); }
        // get category and name
        const category: string = pluralizeProductName(product.category);
        const name: string = product.name;


        // get highlighted images array
        let reviewImages: Record<string, string>[] = review.get('images');
        let fileNames: string[] = [];
        let updatedImages: Record<string, string>[] = updateReviewDto.updatedImages as unknown as Record<string, string>[];

        if (images) {
            // save images
            try {
                fileNames = await firstValueFrom(this.imageServiceClient.send({ cmd: 'save-product-review-images' }, {
                    category,
                    name,
                    images
                }));
            } catch (err) { throw new RpcException(err); }

            const imagesArray = fileNames.map(fileName =>
            ({
                imageName: fileName,
                imageUrl: `${this.configService.get<string>('SERVER_URL')}/products/${category.toLowerCase()}/${standardizeFolderNames(name)}/review-images/${fileName}`
            })
            )

            if (updatedImages) {
                updatedImages = JSON.parse(updatedImages as unknown as string);
                console.log({ test: [...updatedImages, ...imagesArray] })
                reviewImages = [...updatedImages, ...imagesArray];
            } else {
                reviewImages = [...reviewImages, ...imagesArray];
            }
        } else {
            if (updatedImages) {
                updatedImages = JSON.parse(updatedImages as unknown as string);
                reviewImages = [...updatedImages];
            }
        }

        // re-asign highlighted images
        review.set('images', reviewImages);

        try {
            // remove old images
            if (updatedImages) {
                const newImages: string[] = reviewImages.map(reviewImage => reviewImage.imageName);
                await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-old-review-images' }, {
                    name,
                    category,
                    newImages
                }));
            }
            review.set('content', updateReviewDto.content);
            review.set('ratingStar', updateReviewDto.ratingStar);
            await review.save();
        } catch (err) {
            // remove all files that has been uploaded if there is an error occur while saving to the database
            if (images) {
                await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-review-images' }, {
                    category,
                    name,
                    deletedImages: fileNames
                }));
            }
            throw new RpcException(err);
        }

        return { message: 'Review updated' };
    }

    async deleteReview(user: User, review: Document<Types.ObjectId, any, Review>): Promise<{ message: string }> {

        // check for valid user
        if (user.id.toString() !== review.get('user').toString()) throw new RpcException({ message: 'Forbidden', statusCode: HttpStatus.FORBIDDEN });

        await review.deleteOne();

        let product: any;
        try {
            product = await firstValueFrom(this.productServiceClient.send({ cmd: 'get-product' }, review.get('product')));
        } catch (err) { throw new RpcException(err); }
        // get category and name
        const category: string = pluralizeProductName(product.category);
        const name: string = product.name;

        // remove product review images folder
        try {
            await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-review-images-folder' }, {
                category,
                name
            }));
        } catch (err) { throw new RpcException(err); }

        return { message: 'Review deleted' };
    }
}