import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Product {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    brand: string;

    @Prop({ 
        required: true, 
        enum: ['Laptop', 'SmartPhone', 'Tablet', 'SmartWatch', 'Cable', 'Charger', 'Mouse', 'Keyboard', 'Headphone'] 
    })
    category: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);