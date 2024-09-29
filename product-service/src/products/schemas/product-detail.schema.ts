import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { Product } from "./product.schema";
import { Types } from "mongoose";

@Schema({ timestamps: false, _id: false })
export class DetailItem {
    
    @Prop({ required: true })
    title: string;

    @Prop()
    value?: string;
}

@Schema({ timestamps: true })
export class ProductDetail {
    
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Product;

    @Prop({ required: true, min: 0 })
    guaranteePeriod: number;

    @Prop([String])
    includedAccessories: string[];

    @Prop({ type: [DetailItem], required: false })
    processor?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    ramMemoryAndHardDrive?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    screen?: DetailItem[];
    
    @Prop({ type: [DetailItem], required: false })
    graphicsAndAudio?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    connectionPortAndExpansionFeature?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    sizeAndWeight?: DetailItem[]

    @Prop({ type: [DetailItem], required: false })
    additionalInformation?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    camera?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    selfie?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    operatingSystemAndCPU?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    ramRom?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    connection?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    batteryAndCharger?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    utility?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    generalInformation?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    design?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    battery?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    configurationAndConnection?: DetailItem[];

    @Prop({ type: [DetailItem], required: false })
    details?: DetailItem[];

    @Prop([raw({
        color: { type: String, required: true },
        colorImages: [{ imageName: { type: String, required: true }, imageUrl: { type: String, required: true } }]
    })])
    colors: Record<string, any>[];

    @Prop([raw({
        imageName: { type: String, required: true },
        imageUrl: { type: String, required: true }
    })])
    highlightedImages: Record<string, string>[];
}

export const ProductDetailSchema = SchemaFactory.createForClass(ProductDetail);