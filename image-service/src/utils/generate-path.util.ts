import { join } from "path";
import { standardizeFolderNames } from "./standardize-names.util";
import { ProductImageDto } from "src/image-service/dtos/product-image.dto";

// generate folder path for product image
export const generateProductImageFolderPath = (productImageDto: ProductImageDto): string => {

    const folderPath: string = join(
        __dirname, '..', '..', 'public', 'products',
        productImageDto.category.toLowerCase(),
        standardizeFolderNames(productImageDto.productName),
        standardizeFolderNames(productImageDto.color)
    );

    return folderPath;
}

// generate file path for product image
export const gererateProductImageFilePath = (productImageDto: ProductImageDto): string => {

    const folderPath: string = generateProductImageFolderPath(productImageDto);

    const filePath = join(folderPath, productImageDto.imageOriginalname);
    return filePath;
}

// generate folder path for product
export const generateProductFolderPath = (category: string, name: string): string => {

    const folderPath: string = join(
        __dirname, '..', '..', 'public', 'products',
        category.toLowerCase(),
        standardizeFolderNames(name),
    );

    return folderPath;
}

// generate folder path for product
export const generateProductHighlightedImagesFolderPath = (category: string, name: string): string => {

    const folderPath: string = join(
        __dirname, '..', '..', 'public', 'products',
        category.toLowerCase(),
        standardizeFolderNames(name),
        'highlighted-images'
    );

    return folderPath;
}

// generate folder path for product
export const generateProductReviewsImagesFolderPath = (category: string, name: string): string => {

    const folderPath: string = join(
        __dirname, '..', '..', 'public', 'products',
        category.toLowerCase(),
        standardizeFolderNames(name),
        'review-images'
    );

    return folderPath;
}