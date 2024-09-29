import { InjectModel } from "@nestjs/mongoose";
import { ProductVariant } from "../schemas/product-variant.schema";
import { Document, FlattenMaps, Model, Types } from "mongoose";
import { CreateProductVariantDto } from "../dtos/product-variants/create-product-variant.dto";
import { Product } from "../schemas/product.schema";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { HttpStatus, Inject } from "@nestjs/common";
import { pluralizeProductName, standardizeFolderNames } from "../utils/standardize-names.util";
import { firstValueFrom } from "rxjs";
import { UpdateProductVariantDto } from "../dtos/product-variants/update-product-variant.dto";
import { generateVariantRequiredFields } from "../utils/required-fields.util";

export class ProductVariantsService {

    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(ProductVariant.name) private productVariantModel: Model<ProductVariant>,
        @Inject('STOCK_SERVICE') private stockServiceClient: ClientProxy,
        @Inject('IMAGE_SERVICE') private imageServiceClient: ClientProxy,
        private configService: ConfigService
    ) { }

    async getProductVariants(productId: Types.ObjectId): Promise<ProductVariant[]> {

        const productVariants: any[] = await this.productVariantModel.find({ product: productId }).lean().exec();

        if (!productVariants.length) throw new RpcException({ message: 'Product variants not found', statusCode: HttpStatus.NOT_FOUND });

        // get quantity
        for (const productVariant of productVariants) {
            let inventory: any;
            try {
                inventory = await firstValueFrom(this.stockServiceClient.send({ cmd: 'get-product-in-inventory' }, productVariant._id));
            } catch (err) {
                throw new RpcException(err);
            }
            productVariant.quantity = inventory.quantity;
        }

        return productVariants as ProductVariant[];
    }

    async createProductVariant(
        createProductVariantDto: CreateProductVariantDto,
        image?: Express.Multer.File): Promise<{ message: string }> {

        // get category
        const product: FlattenMaps<Product> & { _id: Types.ObjectId } = await this.productModel.findOne({ _id: createProductVariantDto.product }).lean().exec();
        const category: string = pluralizeProductName(product.category);

        // check whether image is exist or not
        let imageObj: Record<string, any> = {};
        if (image) {
            // check whether duplicate color or not
            const duplicate: ProductVariant = await this.productVariantModel.findOne({
                product: product._id,
                color: createProductVariantDto.color
            }).lean().exec();

            if (duplicate) throw new RpcException({ message: 'Color already has image. Do not need to send image', statusCode: HttpStatus.BAD_REQUEST });

            // get image object
            imageObj = {
                imageName: image.originalname,
                imageUrl: `${this.configService.get<string>('SERVER_URL')}/products/${category.toLowerCase()}/${standardizeFolderNames(product.name)}/${standardizeFolderNames(createProductVariantDto.color)}/${image.originalname}`
            }
        } else {
            // get image object
            const productVariant: ProductVariant = await this.productVariantModel.findOne({
                product: product._id,
                color: createProductVariantDto.color
            }).lean().exec();

            if (!image) {
                if (!productVariant) throw new RpcException({ message: 'Image is required', statusCode: HttpStatus.BAD_REQUEST });
            }

            imageObj = {
                imageName: productVariant.image.imageName,
                imageUrl: productVariant.image.imageUrl
            };
        }

        // parse json for discount object
        createProductVariantDto.discount = JSON.parse(createProductVariantDto.discount as unknown as string);
        // casting product to Types.ObjectId
        createProductVariantDto.product = new Types.ObjectId(createProductVariantDto.product);

        const newProductVariant: Document<Types.ObjectId, any, ProductVariant> = new this.productVariantModel({
            ...createProductVariantDto,
            image: imageObj
        });

        try {
            // save images if image sent
            if (image) {
                await firstValueFrom(this.imageServiceClient.send(
                    { cmd: 'save-product-image' },
                    { productName: product.name, category, color: createProductVariantDto.color, image }
                ))
            }

            const createdProductVariant: Document<Types.ObjectId, any, ProductVariant> = await newProductVariant.save();

            // send message to inventory to save product variant to inventory
            await firstValueFrom(this.stockServiceClient.send({ cmd: 'add-product-to-inventory' }, { productId: createdProductVariant._id, quantity: createProductVariantDto.quantity }));

            // send message to imported products to save product variant to imported products
            await firstValueFrom(this.stockServiceClient.send({ cmd: 'add-product-to-imported-products' }, { productId: createdProductVariant._id, quantity: createProductVariantDto.quantity }));
        } catch (err) {
            // rollback image if have errors when saving to database (if image sent)
            if (image) {
                await firstValueFrom(this.imageServiceClient.send(
                    { cmd: 'delete-product-image' },
                    { productName: product.name, category, color: createProductVariantDto.color, imageOriginalname: image.originalname }
                ))
            }

            throw new RpcException(err);
        }

        return { message: 'Product variant created' };
    }

    async updateProductVariant(
        updateProductVariantDto: UpdateProductVariantDto,
        image?: Express.Multer.File): Promise<{ message: string }> {

        // get product variant object
        const productVariantObj: Document<Types.ObjectId, any, ProductVariant> = updateProductVariantDto.productVariantObj;
        const oldColor: string = productVariantObj.get('color');
        const oldImageName: string = productVariantObj.get('image').imageName;

        // get product
        const product: FlattenMaps<Product> & { _id: Types.ObjectId } = await this.productModel.findOne({ _id: updateProductVariantDto.product }).lean().exec();
        const category: string = pluralizeProductName(product.category);
        const requiredFields: string[] = generateVariantRequiredFields(product.category);

        // get duplicate product variant with the same color if exist
        const duplicateVariantColor: FlattenMaps<ProductVariant> & { _id: Types.ObjectId } = await this.productVariantModel.findOne({ product: product._id, color: updateProductVariantDto.color }).lean().exec();

        // check whether image is sent or not
        let imageObj: Record<string, any> = {};
        if (image) {
            imageObj = {
                imageName: image.originalname,
                imageUrl: `${this.configService.get<string>('SERVER_URL')}/products/${category.toLowerCase()}/${standardizeFolderNames(product.name)}/${standardizeFolderNames(updateProductVariantDto.color)}/${image.originalname}`
            }
        } else {
            if (oldColor !== updateProductVariantDto.color) {
                // check whether color alraedy exist in this product
                if (duplicateVariantColor) {
                    // change imageUrl
                    imageObj = {
                        imageName: duplicateVariantColor.image.imageName,
                        imageUrl: duplicateVariantColor.image.imageUrl
                    }
                } else {
                    // change imageUrl
                    imageObj = {
                        imageName: productVariantObj.get('image').imageName,
                        imageUrl: `${this.configService.get<string>('SERVER_URL')}/products/${category.toLowerCase()}/${standardizeFolderNames(product.name)}/${standardizeFolderNames(updateProductVariantDto.color)}/${productVariantObj.get('image').imageName}`
                    }
                }
            } else {
                imageObj = productVariantObj.get('image');
            }
        }

        // set required fields for update
        for (const requiredField of requiredFields) {
            productVariantObj.set(requiredField, updateProductVariantDto[requiredField]);
        }
        // set remaining fields
        productVariantObj.set('color', updateProductVariantDto.color);
        productVariantObj.set('price', updateProductVariantDto.price);
        productVariantObj.set('discount', typeof updateProductVariantDto.discount !== 'object' ? JSON.parse(updateProductVariantDto.discount as unknown as string) : updateProductVariantDto.discount);
        productVariantObj.set('status', updateProductVariantDto.status);
        productVariantObj.set('image', imageObj);

        // save data
        try {
            // save image if it sent
            if (image) {
                await firstValueFrom(this.imageServiceClient.send(
                    { cmd: 'save-product-image' },
                    { productName: product.name, category, color: updateProductVariantDto.color, image }
                ));

                // change image field for all product variant has the same color
                const sameColorVariants: Document<Types.ObjectId, any, ProductVariant>[] = await this.productVariantModel.find({ product: product._id, color: updateProductVariantDto.color }).exec();

                for (const sameColorVariant of sameColorVariants) {
                    sameColorVariant.set('image', productVariantObj.get('image'));
                    await sameColorVariant.save();
                }

                // remove old image if image sent is different from old image
                if (updateProductVariantDto.color !== oldColor || image.originalname !== oldImageName) {
                    await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-image' }, {
                        productName: product.name,
                        category,
                        color: oldColor,
                        imageOriginalname: oldImageName
                    }))
                }

            } else {
                // if image not sent but has color change, change the storage directory
                if (oldColor !== updateProductVariantDto.color) {
                    if (duplicateVariantColor) {
                        // delete old color image folder
                        await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-image-folder' }, {
                            productName: product.name,
                            color: oldColor,
                            category
                        }))
                    } else {
                        // rename image folder
                        await firstValueFrom(this.imageServiceClient.send({ cmd: 'rename-product-image-folder' }, {
                            productName: product.name,
                            newColor: updateProductVariantDto.color,
                            oldColor,
                            category
                        }))
                    }
                }
            }

            // save product variant
            await productVariantObj.save();

            // update quantity in inventory
            await firstValueFrom(this.stockServiceClient.send({ cmd: 'update-product-quantity-in-inventory' }, { productId: productVariantObj._id, quantity: updateProductVariantDto.quantity }));

            // update quantity in imported
            await firstValueFrom(this.stockServiceClient.send({ cmd: 'update-product-quantity-in-imported-products' }, { productId: productVariantObj._id, quantity: updateProductVariantDto.quantity }));
        } catch (err) {

            if (image) {
                await firstValueFrom(this.imageServiceClient.send(
                    { cmd: 'delete-product-image' },
                    { productName: product.name, category, color: updateProductVariantDto.color, imageOriginalname: image.originalname }
                ));
            }

            throw new RpcException(err);
        }

        return { message: 'Product variant updated' };
    }

    async deleteProductVariant(productId: Types.ObjectId, productVariantId: Types.ObjectId): Promise<{ message: string }> {

        // check whether product is exist or not
        const product: Product = await this.productModel.findOne({ _id: productId }).lean().exec();

        if (!product) throw new RpcException({ message: 'Product not found', statusCode: HttpStatus.NOT_FOUND });

        // check whether product variant is exist or not
        const productVariant: Document<Types.ObjectId, any, ProductVariant> = await this.productVariantModel.findOne({ _id: productVariantId }).exec();

        if (!productVariant) throw new RpcException({ message: 'Product variant not found', statusCode: HttpStatus.NOT_FOUND });

        if (productVariant.get('status')) throw new RpcException({ message: 'Not allowed to delete active product variant', statusCode: HttpStatus.FORBIDDEN });

        // asign name, color, category
        const name: string = product.name;
        const color: string = productVariant.get('color');
        const category: string = pluralizeProductName(product.category);

        // delete product variant
        await productVariant.deleteOne();

        // delete product inventory
        await firstValueFrom(this.stockServiceClient.send({ cmd: 'delete-product-in-inventory' }, productVariantId));

        // delte product in imported products
        await firstValueFrom(this.stockServiceClient.send({ cmd: 'delete-product-in-imported-products' }, productVariantId));

        // check whether have this variant color in product variants
        const duplicateVariantColor: ProductVariant = await this.productVariantModel.findOne({ product: productId, color: color }).lean().exec();

        if (!duplicateVariantColor) {
            // remove image folder
            await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-image-folder' }, {
                productName: name,
                color,
                category
            }));
        }

        return { message: 'Product variant deleted' };
    }

    async getProductVariant(productId: Types.ObjectId, productVariantId: Types.ObjectId): Promise<ProductVariant> {

        // check whether product is exist or not
        const product: Product = await this.productModel.findOne({ _id: productId }).lean().exec();

        if (!product) throw new RpcException({ message: 'Product not found', statusCode: HttpStatus.NOT_FOUND });

        // check whether product variant is exist or not
        const productVariant: any = await this.productVariantModel.findOne({ _id: productVariantId }).lean().exec();

        if (!productVariant) throw new RpcException({ message: 'Product variant not found', statusCode: HttpStatus.NOT_FOUND });

        // get quantity
        let inventory: any;
        try {
            inventory = await firstValueFrom(this.stockServiceClient.send({ cmd: 'get-product-in-inventory' }, productVariant._id));
        } catch (err) { throw new RpcException(err); }

        productVariant.quantity = inventory.quantity;
        return productVariant as ProductVariant;
    }

    async getProductVariantWithoutProductId(productVariantId: Types.ObjectId): Promise<ProductVariant> {

        const productVariant: ProductVariant = await this.productVariantModel.findOne({ _id: productVariantId }).lean().exec();

        if (!productVariant) throw new RpcException({ message: 'Product variant not found', statusCode: HttpStatus.NOT_FOUND });

        return productVariant;
    }

    async getPopulatedProductVariantWithoutProductId(productVariantId: Types.ObjectId): Promise<ProductVariant> {

        const productVariant: ProductVariant = await this.productVariantModel.findOne({ _id: productVariantId }).populate('product').lean().exec();

        if (!productVariant) throw new RpcException({ message: 'Product variant not found', statusCode: HttpStatus.NOT_FOUND });

        return productVariant;
    }
}