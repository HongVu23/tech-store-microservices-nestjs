import { Module } from "@nestjs/common";
import { ReviewsModule } from "./reviews/reviews.module";

@Module({
    imports: [ReviewsModule]
})
export class ReviewServiceModule {}