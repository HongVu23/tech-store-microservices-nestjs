import { Document, Types } from "mongoose";
import { ProductDetail } from "../schemas/product-detail.schema";
import { HttpStatus } from "@nestjs/common";

// check whether updatedImages is valid or not
export const isValidUpdatedImages = (productDetail: Document<Types.ObjectId, any, ProductDetail>, updatedImages?: Record<string, string>[]) => {

    const highlightedImages: Record<string, string>[] = productDetail.get('highlightedImages');

    updatedImages = JSON.parse(updatedImages as unknown as string);

    for (const image of updatedImages) {

        let isValid = false;
        for (const highlightedImage of highlightedImages) {

            if (highlightedImage.imageName === image.imageName && highlightedImage.imageUrl === image.imageUrl) {
                isValid = true;
                break;
            }
        }

        if (!isValid) return { isValid: false, error: { message: 'Invalid image are found', statusCode: HttpStatus.BAD_REQUEST } };
    }

    // 'Invalid number of image are found'
    for (let i = 0; i < updatedImages.length - 1; i++) {
        for (let j = i + 1; j < updatedImages.length; j++) {
            if (updatedImages[i].imageName === updatedImages[j].imageName && updatedImages[i].imageUrl === updatedImages[j].imageUrl) {
                return { isValid: false, error: { message: 'Invalid number of image are found', statusCode: HttpStatus.BAD_REQUEST } };
            }
        }
    }

    return { isValid: true };
}