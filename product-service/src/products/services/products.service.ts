import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product } from "../schemas/product.schema";
import { Document, Model, Types } from "mongoose";
import { CreateProductDto } from "../dtos/products/create-product.dto";
import { UpdateProductDto } from "../dtos/products/update-product.dto";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { ProductVariant } from "../schemas/product-variant.schema";
import { firstValueFrom } from "rxjs";
import { pluralizeProductName } from "../utils/standardize-names.util";
import { ProductDetail } from "../schemas/product-detail.schema";
import { generateDuplicateFields } from "../utils/duplicate-fields.util";
@Injectable()
export class ProductsService {

    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(ProductVariant.name) private productVariantModel: Model<ProductVariant>,
        @InjectModel(ProductDetail.name) private productDetailModel: Model<ProductDetail>,
        @Inject('IMAGE_SERVICE') private imageServiceClient: ClientProxy,
        @Inject('STOCK_SERVICE') private stockServiceClient: ClientProxy,
        @Inject('REVIEW_SERVICE') private reviewServiceClient: ClientProxy
    ) {}

    async getProducts(category?: string): Promise<Product[]> {
        
        let products: Product[];
        if (category) {
            products = await this.productModel.find({ category }).lean().exec();
        } else {
            products = await this.productModel.find().lean().exec();
        }

        if (!products.length) throw new RpcException({ message: 'No products found', statusCode: HttpStatus.NOT_FOUND });

        return products;
    }

    async createProduct(createProductDto: CreateProductDto): Promise<{ message: string }> {

        await this.productModel.create(createProductDto);

        return { message: 'Product created' };
    }

    async getFullProductsInfos(category?: string): Promise<any[]> {
        // get all products
        let products: Document<Types.ObjectId, any, Product>[];
        if (category) {
            products = await this.productModel.find({ category: category }).exec();
        } else {
            products = await this.productModel.find().exec();
        }

        const responeArray: any[] = [];

        for (const product of products) {
            let result: any;
            try {
                result = await this.getFullProductInfos(product);
                responeArray.push(result);
            } catch (err) {
                continue;
            }
        }

        return responeArray;
    }

    async searchProductForAdmin(text: string): Promise<any[]> {

        if (!text) return [];
    
        const regex: RegExp = new RegExp(text, 'i');
        const searchResults =  await this.productModel.find({ name: regex }).lean().exec(); 

        return searchResults;
    }

    async searchProduct(text: string): Promise<any[]> {

        if (!text) return [];
    
        const regex: RegExp = new RegExp(text, 'i');
        let searchResults =  await this.productModel.find({ name: regex }).lean().exec(); 
    
        // filter for product that has variants
        const productsWithoutVariant = []
        
        for (const searchResult of searchResults) {
            
            // check whether has variants or not
            const variants = await this.productVariantModel.find({ product: searchResult._id, status: true }).lean().exec();
    
            if (!variants.length) {
                productsWithoutVariant.push(searchResult._id)
            }
        }
    
        // filter search results which does not have variants
        searchResults = searchResults.filter(product => !productsWithoutVariant.includes(product._id));
        
        return searchResults;
    }

    async updateProduct(
        product: Document<Types.ObjectId, any, Product>, 
        updateProductDto: UpdateProductDto): Promise<{ message: string }> {

        // check for duplicate product
        if (product.get('name') !== updateProductDto.name) {
            const duplicate = await this.productModel.findOne({ name: updateProductDto.name, category: product.get('category') }).lean().exec();
            if (duplicate) throw new RpcException({ message: 'Duplicate product', statusCode: HttpStatus.CONFLICT });
        } 

        product.set('name', updateProductDto.name);
        product.set('brand', updateProductDto.brand);

        await product.save();

        return { message: "Product updated" }
    }

    async deleteProduct(product: Document<Types.ObjectId, any, Product>): Promise<{ message: string }> {

        // check whether product have variants or not
        const productVariants: ProductVariant[] = await this.productVariantModel.find({ product: product._id }).lean().exec();

        if (productVariants.length) throw new RpcException({ message: 'Not allowed to delete product that have variants', statusCode: HttpStatus.FORBIDDEN });

        // check whether product have details or not
        const productDetail: ProductDetail = await this.productDetailModel.findOne({ product: product._id }).lean().exec();

        if (productDetail) throw new RpcException({ message: 'Not allowed to delete product that have details', statusCode: HttpStatus.FORBIDDEN });

        // asign category and name before delete
        const category: string = pluralizeProductName(product.get('category'));
        const name: string = product.get('name');

        await product.deleteOne();

        // remove product folder
        await firstValueFrom(this.imageServiceClient.send({ cmd: 'delete-product-folder' }, {
            category,
            name
        }))

        return { message: 'Product deleted' };
    }

    getProduct(product: Document<Types.ObjectId, any, Product>): Document<Types.ObjectId, any, Product> {
        return product;
    }

    async getFullProductInfos(product: Document<Types.ObjectId, any, Product>): Promise<any> {

        // product = product.toObject();
        const plainProduct: any = product.toObject();
        delete plainProduct.createdAt;
        delete plainProduct.updatedAt
        delete plainProduct.__v;

        // find all product variants
        const productVariants: any[] = await this.productVariantModel.find({ product: product._id, status: true }).select('-createdAt -updatedAt -__v').lean().exec();

        if (!productVariants.length) throw new RpcException({ message: 'No informations found', statusCode: HttpStatus.NOT_FOUND });

        // get required fields
        const requiredFields: string[] = generateDuplicateFields(product.get('category'));

        // agin values
        for (const requiredField of requiredFields) {
            plainProduct[requiredField + 's'] = [];
        }

        for (const productVariant of productVariants) {
            // find quantity in product inventories
            // const productInventory = await ProductInventory.findOne({ product: productVariant._id }).lean().exec()
            let inventory: any;
            try {
                inventory = await firstValueFrom(this.stockServiceClient.send({ cmd: 'get-product-in-inventory' }, productVariant._id));
            } catch (err) { throw new RpcException(err); }
            // asign quantity
            productVariant.quantity = inventory.quantity;

            for (const requiredField of requiredFields) {
                plainProduct[requiredField + 's'].push(productVariant[requiredField]);
            }
        }

        for (const requiredField of requiredFields) {
            plainProduct[requiredField + 's'] = [...new Set(plainProduct[requiredField + 's'])];
        }
        plainProduct.variants = productVariants;

        // get rating star statistics for product
        let ratingStarStatistics: any;
        try {
            ratingStarStatistics = await firstValueFrom(this.reviewServiceClient.send({ cmd: 'get-overall-star-rating-statistics' }, product._id));
        } catch (err) { throw new RpcException(err); }

        plainProduct.ratingStarStatistics = ratingStarStatistics;
        return plainProduct;
    }
}