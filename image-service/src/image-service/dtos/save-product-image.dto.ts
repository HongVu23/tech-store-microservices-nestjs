export class SaveProductImageDto {

    productName: string;

    category: string;

    color: string;

    image: Express.Multer.File;
}