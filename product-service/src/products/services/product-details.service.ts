import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import { ProductDetail } from "../schemas/product-detail.schema";
import { CreateProductDetailDto } from "../dtos/product-details/create-product-detail.dto";
import { Product } from "../schemas/product.schema";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { UpdateProductDetailDto } from "../dtos/product-details/update-product-detail.dto";
import { generatDetailRequiredFields } from "../utils/required-fields.util";
import { pluralizeProductName, standardizeFolderNames } from "../utils/standardize-names.util";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";
import { isValidUpdatedImages } from "../helpers/highlighted-images-validation.helper";

@Injectable()
export class ProductDetailsService {

    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(ProductDetail.name) private productDetailModel: Model<ProductDetail>,
        @Inject('IMAGE_SERVICE') private imageServiceClient: ClientProxy,
        private configService: ConfigService
    ) { }

    async getProductDetail(product: Document<Types.ObjectId, any, Product>): Promise<ProductDetail> {

        const productDetail: ProductDetail = await this.productDetailModel.findOne({ product: product._id }).lean().exec();

        if (!productDetail) throw new RpcException({ message: 'Product detail not found', statusCode: HttpStatus.NOT_FOUND });

        const requiredFields: string[] = generatDetailRequiredFields(product.get('category'));
        Object.keys(productDetail).forEach(prop => {
            if (Array.isArray(productDetail[prop]) && !productDetail[prop].length && !requiredFields.includes(prop) && prop !== 'highlightedImages') {
                delete productDetail[prop];
            }
        })

        return productDetail;
    }

    async createProductDetail(createProductDetailDto: CreateProductDetailDto): Promise<{ message: string }> {

        const { product, ...destructedCreateProductDetailDto } = createProductDetailDto;
        const productId: Types.ObjectId = new Types.ObjectId(product);

        const newProductDetail: Document<Types.ObjectId, any, ProductDetail> = new this.productDetailModel({
            product: productId,
            ...destructedCreateProductDetailDto
        });

        // save
        await newProductDetail.save();

        return { message: 'Product detail created' };
    }

    async updateProductDetail(updateProductDetailDto: UpdateProductDetailDto): Promise<{ message: string }> {

        // get product object
        const product: Product = await this.productModel.findOne({ _id: updateProductDetailDto.product }).lean().exec();
        const category: string = product.category;

        // get product detail object
        const productDetailObj: Document<Types.ObjectId, any, ProductDetail> = updateProductDetailDto.productDetailObj;

        // get required fields
        const requiredFields: string[] = generatDetailRequiredFields(category);

        // set date before update
        for (const requiredField of requiredFields) {
            productDetailObj.set(requiredField, updateProductDetailDto[requiredField]);
        }
        // set remaining fields
        productDetailObj.set('guaranteePeriod', updateProductDetailDto.guaranteePeriod);
        productDetailObj.set('includedAccessories', updateProductDetailDto.includedAccessories);

        // save
        await productDetailObj.save();

        return { message: 'Product detail updated' };
    }

    async deleteProductDetail(product: Document<Types.ObjectId, any, Product>, productDetailId: Types.ObjectId): Promise<{ message: string }> {

        // check whether product detail is exist or not
        const productDetail: Document<Types.ObjectId, any, ProductDetail> = await this.productDetailModel.findOne({ _id: productDetailId }).exec();

        if (!productDetail) throw new RpcException({ message: 'Product detail not found', statusCode: HttpStatus.NOT_FOUND });

        // remove hight light images
        const category: string = pluralizeProductName(product.get('category'));
        const name: string = product.get('name');

        await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-highlighted-images-folder' }, {
            category,
            name
        }))

        await productDetail.deleteOne();

        return { message: 'Product detail delete' };
    }

    /* Highlighted Images (Product Details) */

    async getHighlightedImages(product: Document<Types.ObjectId, any, Product>, productDetailId: Types.ObjectId): Promise<Record<string, string>[]> {

        // check whether product detail is exist or not
        const productDetail: ProductDetail = await this.productDetailModel.findOne({ _id: productDetailId }).lean().exec();

        if (!productDetail) throw new RpcException({ message: 'Product detail not found', statusCode: HttpStatus.NOT_FOUND });

        return productDetail.highlightedImages;
    }

    async createHighlightedImages(
        product: Document<Types.ObjectId, any, Product>,
        productDetailId: Types.ObjectId,
        images: Array<Express.Multer.File>): Promise<{ message: string }> {

        // check whether product detail is exist or not
        const productDetail: Document<Types.ObjectId, any, ProductDetail> = await this.productDetailModel.findOne({ _id: productDetailId }).exec();

        if (!productDetail) throw new RpcException({ message: 'Product detail not found', statusCode: HttpStatus.NOT_FOUND });

        // get category and name
        const category: string = pluralizeProductName(product.get('category'));
        const name: string = product.get('name');

        try {
            // save highlighted image in image-service
            const fileNames: string[] = await firstValueFrom(this.imageServiceClient.send({ cmd: 'save-product-highlighted-images' }, {
                name,
                category,
                images
            }));

            // save imageName and imageUrl to highlightedImages array
            const hightlightedImagesArray: Record<string, string>[] = productDetail.get('highlightedImages');
            for (const fileName of fileNames) {
                const imageObj: Record<string, string> = {
                    imageName: fileName,
                    imageUrl: `${this.configService.get<string>('SERVER_URL')}/products/${category.toLowerCase()}/${standardizeFolderNames(name)}/highlighted-images/${fileName}`
                }
                hightlightedImagesArray.push(imageObj);
            }

            // save
            await productDetail.save();
        } catch (err) {
            // remove image if has error occurs
            await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-highlighted-images-folder' }, {
                category,
                name
            }))

            throw new RpcException(err);
        }

        return { message: 'Create highlighted images success' };
    }

    async updateHighlightedImages(
        product: Document<Types.ObjectId, any, Product>,
        productDetailId: Types.ObjectId,
        images?: Array<Express.Multer.File>,
        updatedImages?: Record<string, string>[]): Promise<{ message: string }> {

        // check whether product detail is exist or not
        const productDetail: Document<Types.ObjectId, any, ProductDetail> = await this.productDetailModel.findOne({ _id: productDetailId }).exec();

        if (!productDetail) throw new RpcException({ message: 'Product detail not found', statusCode: HttpStatus.NOT_FOUND });

        // check whether updatedImages is valid or not
        if (updatedImages) {
            const isValid = isValidUpdatedImages(productDetail, updatedImages);
            if (!isValid) throw new RpcException(isValid.error);
        }

        // get category and name
        const category: string = pluralizeProductName(product.get('category'));
        const name: string = product.get('name');

        // get highlighted images array
        let highlightedImages: Record<string, string>[] = productDetail.get('highlightedImages');
        let fileNames: string[] = [];

        if (images) {
            // save highlight images
            fileNames = await firstValueFrom(this.imageServiceClient.send({ cmd: 'save-product-highlighted-images'}, {
                name,
                category,
                images
            } ));

            const imagesArray = fileNames.map(fileName =>
            ({
                imageName: fileName,
                imageUrl: `${this.configService.get<string>('SERVER_URL')}/products/${category.toLowerCase()}/${standardizeFolderNames(name)}/highlighted-images/${fileName}`
            }));

            if (updatedImages) {
                updatedImages = JSON.parse(updatedImages as unknown as string);
                highlightedImages = [...updatedImages, ...imagesArray];
            } else {
                highlightedImages = [...highlightedImages, ...imagesArray];
            }
        } else {
            if (updatedImages) {
                updatedImages = JSON.parse(updatedImages as unknown as string);
                highlightedImages = [...updatedImages];
            }
        }

        // re-asign highlighted images
        productDetail.set('highlightedImages', highlightedImages);

        // save data
        try {
            // remove old images
            if (updatedImages) {
                
                const newImages: string[] = highlightedImages.map(highlightedImage => highlightedImage.imageName);
                await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-old-highlighted-images' }, {
                    name,
                    category,
                    newImages
                }));
            }

            await productDetail.save();
        } catch (err) {

            // remove all files that has been uploaded if there is an error occur while saving to the database
            if (images) {
                await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-highlighted-images' }, {
                    category,
                    name,
                    deletedImages: fileNames
                }));
            }

            throw new RpcException(err);
        }

        return { message: 'Highlighted images updated' };
    }

    async deleteHighlightedImages(product: Document<Types.ObjectId, any, Product>, productDetailId: Types.ObjectId): Promise<{ message: string }> {

        // check whether product detail is exist or not
        const productDetail: Document<Types.ObjectId, any, ProductDetail> = await this.productDetailModel.findOne({ _id: productDetailId }).exec();

        if (!productDetail) throw new RpcException({ message: 'Product detail not found', statusCode: HttpStatus.NOT_FOUND });

        // delete product highlighted images
        productDetail.set('highlightedImages', []);
        await productDetail.save();

        // get category and name
        const category: string = pluralizeProductName(product.get('category'));
        const name: string = product.get('name');

        // delete highlighted images folder
        await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-highlighted-images-folder' }, {
            category, 
            name
        }))

        return { message: 'Highlighted images deleted' };
    }
}