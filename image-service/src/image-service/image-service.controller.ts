import { Controller, UseFilters } from "@nestjs/common";
import { ImageService } from "./image-service.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { SaveProductImageDto } from "./dtos/save-product-image.dto";
import { AllExceptionsFilter } from "src/filters/all-exceptions.filter";
import { DeleteProductImageDto } from "./dtos/delete-product-image.dto";
import { RenameProductImageFolder } from "./dtos/rename-product-image-folder.dto";
import { DeleteProductImageFolderDto } from "./dtos/delete-product-image-folder.dto";

@Controller()
@UseFilters(AllExceptionsFilter)
export class ImageServiceController {

    constructor(private imageService: ImageService) {}

    @MessagePattern({ cmd: 'save-product-image' })
    saveProductImage(@Payload() saveProductImageDto: SaveProductImageDto): { message: string } {
        return this.imageService.saveProductImage(saveProductImageDto);
    }

    @MessagePattern({ cmd: 'delete-product-image' })
    deleteProductImage(@Payload() deleteProductImageDto: DeleteProductImageDto): { message: string } {
        return this.imageService.deleteProductImage(deleteProductImageDto);
    }

    @MessagePattern({ cmd: 'rename-product-image-folder' })
    renameProductImageFolder(@Payload() renameProductImageFolder: RenameProductImageFolder): { message: string } {
        return this.imageService.renameProductImageFolder(renameProductImageFolder);
    }

    @MessagePattern({ cmd: 'delete-product-image-folder' })
    deleteProductImageFolder(@Payload() deleteProductImageFolderDto: DeleteProductImageFolderDto): { message: string } {
        return this.imageService.deleteProductImageFolder(deleteProductImageFolderDto);
    }

    @MessagePattern({ cmd: 'delete-product-folder' })
    deleteProductFolder(@Payload('category') category: string, @Payload('name') name: string): { message: string } {
        return this.imageService.deleteProductFolder(category, name);
    }

    @MessagePattern({ cmd: 'save-product-highlighted-images' })
    saveProductHighlightedImages(
        @Payload('category') category: string,
        @Payload('name') name: string,
        @Payload('images') images: Array<Express.Multer.File>): string[] {

        return this.imageService.saveProductHighlightedImages(category, name, images);
    }

    @MessagePattern({ cmd: 'delete-product-highlighted-images' })
    deleteProductHighlightedImages(
        @Payload('category') category: string,
        @Payload('name') name: string,
        @Payload('deletedImages') deletedImages: string[]): { message: string } {

        return this.imageService.deleteProductHighlightedImages(category, name, deletedImages);
    }

    @MessagePattern({ cmd: 'delete-product-old-highlighted-images' })
    deleteProductOldHighlightedImages(
        @Payload('category') category: string,
        @Payload('name') name: string,
        @Payload('newImages') newImages: string[]): { message: string } {

        return this.imageService.deleteProductOldHighlightedImages(category, name, newImages);
    }

    @MessagePattern({ cmd: 'delete-product-highlighted-images-folder' })
    deleteProductHighlightedImageFolder(@Payload('category') category: string, @Payload('name') name: string): { message: string } {
        return this.imageService.deleteProductHighlightedImageFolder(category, name);
    }

    @MessagePattern({ cmd: 'save-product-review-images' })
    saveProductReviewImages(
        @Payload('category') category: string,
        @Payload('name') name: string,
        @Payload('images') images: Array<Express.Multer.File>): string[] {

        return this.imageService.saveProductReviewsImages(category, name, images);
    }

    @MessagePattern({ cmd: 'delete-product-review-images-folder' })
    deleteProductReviewImageFolder(@Payload('category') category: string, @Payload('name') name: string): { message: string } {
        return this.imageService.deleteProductReviewImageFolder(category, name);
    }

    @MessagePattern({ cmd: 'delete-product-old-review-images' })
    deleteProductOldReviewImages(
        @Payload('category') category: string,
        @Payload('name') name: string,
        @Payload('newImages') newImages: string[]): { message: string } {

        return this.imageService.deleteProductOldReviewImages(category, name, newImages);
    }

    
    @MessagePattern({ cmd: 'delete-product-highlighted-images' })
    deleteProductReviewImages(
        @Payload('category') category: string,
        @Payload('name') name: string,
        @Payload('deletedImages') deletedImages: string[]): { message: string } {

        return this.imageService.deleteProductReviewImages(category, name, deletedImages);
    }
}