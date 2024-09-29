import { Module } from "@nestjs/common";
import { ReviewServiceClientModule } from "../rmq-client/review-service-client.module";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { AuthModule } from "src/auth-service/auth/auth.module";

@Module({
    imports: [ReviewServiceClientModule, AuthModule],
    controllers: [ReviewsController],
    providers: [ReviewsService]
})
export class ReviewsModule {}