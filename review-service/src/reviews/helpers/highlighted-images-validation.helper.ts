import { Document, Types } from "mongoose";
import { HttpStatus } from "@nestjs/common";
import { Review } from "../schemas/review.schema";

// check whether updatedImages is valid or not
export const isValidUpdatedImages = (review: Document<Types.ObjectId, any, Review>, updatedImages?: Record<string, string>[]) => {

    const reviewImages: Record<string, string>[] = review.get('images');

    updatedImages = JSON.parse(updatedImages as unknown as string);

    for (const image of updatedImages) {

        let isValid = false;
        for (const reviewImage of reviewImages) {

            if (reviewImage.imageName === image.imageName && reviewImage.imageUrl === image.imageUrl) {
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