import { Injectable } from "@nestjs/common";
import { SaveProductImageDto } from "./dtos/save-product-image.dto";
import { ConfigService } from "@nestjs/config";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, rmdirSync, unlinkSync, writeFileSync } from "fs";
import { generateProductFolderPath, generateProductHighlightedImagesFolderPath, generateProductImageFolderPath, generateProductReviewsImagesFolderPath, gererateProductImageFilePath } from "src/utils/generate-path.util";
import { DeleteProductImageDto } from "./dtos/delete-product-image.dto";
import { ProductImageDto } from "./dtos/product-image.dto";
import { RenameProductImageFolder } from "./dtos/rename-product-image-folder.dto";
import { DeleteProductImageFolderDto } from "./dtos/delete-product-image-folder.dto";
import { join } from "path";

@Injectable()
export class ImageService {

    constructor(private configService: ConfigService) { }

    saveProductImage(saveProductImageDto: SaveProductImageDto): { message: string } {

        // asign folder destination and file path to save the image to pulic folder if image file sent
        const productImageDto: ProductImageDto = {
            productName: saveProductImageDto.productName,
            color: saveProductImageDto.color,
            category: saveProductImageDto.category,
            imageOriginalname: saveProductImageDto.image.originalname
        }
        const folderPath: string = generateProductImageFolderPath(productImageDto);
        const imagePath: string = gererateProductImageFilePath(productImageDto);

        if (!existsSync(folderPath)) {
            mkdirSync(folderPath, { recursive: true });
            writeFileSync(imagePath, Buffer.from(saveProductImageDto.image.buffer));
        } else {
            writeFileSync(imagePath, Buffer.from(saveProductImageDto.image.buffer));
        }

        return { message: "Save success" };
    }

    deleteProductImage(deleteProductImageDto: DeleteProductImageDto): { message: string } {

        const folderPath: string = generateProductImageFolderPath(deleteProductImageDto);
        const imagePath: string = gererateProductImageFilePath(deleteProductImageDto);

        if (existsSync(imagePath)) {
            unlinkSync(imagePath);

            if (existsSync(folderPath)) {
                // check whether the directory is empty or not
                const files = readdirSync(folderPath);
                if (files.length === 0) {
                    rmdirSync(folderPath);
                }
            }
        }

        return { message: "Delete success" };
    }

    renameProductImageFolder(renameProductImageFolder: RenameProductImageFolder): { message: string } {

        // old folder path
        const oldFolderPath: string = generateProductImageFolderPath({
            productName: renameProductImageFolder.productName,
            color: renameProductImageFolder.oldColor,
            category: renameProductImageFolder.category
        } as unknown as ProductImageDto);

        // new folder path
        const newFolderPath: string = generateProductImageFolderPath({
            productName: renameProductImageFolder.productName,
            color: renameProductImageFolder.newColor,
            category: renameProductImageFolder.category
        } as unknown as ProductImageDto);

        if (existsSync(oldFolderPath)) {
            renameSync(oldFolderPath, newFolderPath);
        }

        return { message: 'Rename success' };
    }

    deleteProductImageFolder(deleteProductImageFolderDto: DeleteProductImageFolderDto): { message: string } {

        const folderPath: string = generateProductImageFolderPath({
            productName: deleteProductImageFolderDto.productName,
            category: deleteProductImageFolderDto.category,
            color: deleteProductImageFolderDto.color
        } as unknown as ProductImageDto);

        if (existsSync(folderPath)) {
            rmSync(folderPath, { recursive: true, force: true });
        }

        return { message: 'Delete success' };
    }

    deleteProductFolder(category: string, name: string): { message: string } {

        const folderPath: string = generateProductFolderPath(category, name);

        if (existsSync(folderPath)) {
            rmSync(folderPath, { recursive: true, force: true });
        }

        return { message: 'Delete success' };
    }

    saveProductHighlightedImages(category: string, name: string, images: Array<Express.Multer.File>): string[] {

        const folderPath: string = generateProductHighlightedImagesFolderPath(category, name);

        if (!existsSync(folderPath)) {
            mkdirSync(folderPath, { recursive: true });
        }

        // save images
        const fileNames: string[] = [];
        try {
            for (const image of images) {
                const fileName: string = Date.now() + '-' + image.originalname;
                const filePath: string = join(folderPath, fileName);
                fileNames.push(fileName);
                writeFileSync(filePath, Buffer.from(image.buffer));
            }
        } catch (err) {
            // rollback
            if (existsSync(folderPath)) {
                rmSync(folderPath, { recursive: true, force: true });
            }
        }

        return fileNames;
    }

    deleteProductHighlightedImages(category: string, name: string, deletedImages: string[]): { message: string } {

        const folderPath: string = generateProductHighlightedImagesFolderPath(category, name);

        if (existsSync(folderPath)) {
            for (const deletedImage of deletedImages) {
                
                const filePath: string = join(folderPath, deletedImage);

                if (existsSync(filePath)) {
                    unlinkSync(filePath);
                }
            }
        }

        return { message: 'Delete success' };
    }

    deleteProductOldHighlightedImages(category: string, name: string, newImages: string[]): { message: string } {

        const folderPath: string = generateProductHighlightedImagesFolderPath(category, name);

        if (existsSync(folderPath)) {
            const oldImages: string[] = readdirSync(folderPath);

            oldImages.forEach(image => {
                if (!newImages.includes(image)) {
                    const filePath: string = join(folderPath, image)

                    if (existsSync(filePath)) {
                        unlinkSync(filePath)
                    }
                }
            })
        }

        return { message: 'Delete success' };
    } 

    deleteProductHighlightedImageFolder(category: string, name: string): { message: string } {

        const folderPath: string = generateProductHighlightedImagesFolderPath(category, name);

        if (existsSync(folderPath)) {
            rmSync(folderPath, { recursive: true, force: true });
        }

        return { message: 'Delete success' };
    }

    saveProductReviewsImages(category: string, name: string, images: Array<Express.Multer.File>): string[] {

        const folderPath: string = generateProductReviewsImagesFolderPath(category, name);

        if (!existsSync(folderPath)) {
            mkdirSync(folderPath, { recursive: true });
        }

        // save images
        const fileNames: string[] = [];
        try {
            for (const image of images) {
                const fileName: string = Date.now() + '-' + image.originalname;
                const filePath: string = join(folderPath, fileName);
                fileNames.push(fileName);
                writeFileSync(filePath, Buffer.from(image.buffer));
            }
        } catch (err) {
            // rollback
            if (existsSync(folderPath)) {
                rmSync(folderPath, { recursive: true, force: true });
            }
        }

        return fileNames;
    }

    deleteProductReviewImageFolder(category: string, name: string): { message: string } {

        const folderPath: string = generateProductReviewsImagesFolderPath(category, name);

        if (existsSync(folderPath)) {
            rmSync(folderPath, { recursive: true, force: true });
        }

        return { message: 'Delete success' };
    }

    deleteProductOldReviewImages(category: string, name: string, newImages: string[]): { message: string } {

        const folderPath: string = generateProductReviewsImagesFolderPath(category, name);

        if (existsSync(folderPath)) {
            const oldImages: string[] = readdirSync(folderPath);

            oldImages.forEach(image => {
                if (!newImages.includes(image)) {
                    const filePath: string = join(folderPath, image)

                    if (existsSync(filePath)) {
                        unlinkSync(filePath)
                    }
                }
            })
        }

        return { message: 'Delete success' };
    } 

    deleteProductReviewImages(category: string, name: string, deletedImages: string[]): { message: string } {

        const folderPath: string = generateProductReviewsImagesFolderPath(category, name);

        if (existsSync(folderPath)) {
            for (const deletedImage of deletedImages) {
                
                const filePath: string = join(folderPath, deletedImage);

                if (existsSync(filePath)) {
                    unlinkSync(filePath);
                }
            }
        }

        return { message: 'Delete success' };
    }
}