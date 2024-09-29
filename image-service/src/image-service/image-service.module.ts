import { Module } from "@nestjs/common";
import { ImageServiceController } from "./image-service.controller";
import { ImageService } from "./image-service.service";

@Module({
    imports: [],
    controllers: [ImageServiceController],
    providers: [ImageService]
})
export class ImageServiceModule {}