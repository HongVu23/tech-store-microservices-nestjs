import { Module } from "@nestjs/common";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Review, ReviewSchema } from "./schemas/review.schema";
import { ProductServiceClientModule } from "src/rmq-client/product-service-client.module";
import { ImageServiceClientModule } from "src/rmq-client/image-service-client.module";
import { UserServiceClientModule } from "src/rmq-client/user-service-client.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
        ProductServiceClientModule,
        ImageServiceClientModule,
        UserServiceClientModule
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService]
})
export class ReviewsModule {}