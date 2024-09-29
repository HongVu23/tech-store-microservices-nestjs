import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";

@Schema()
export class Address {
    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    defaultAddress: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ timestamps: true })
export class User {

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    password: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ minLenght: 10, maxlength: 10, match: [/^[0-9]{10}$/, 'Phone number is invalid'], default: '' })
    phoneNumber: string;

    @Prop({ enum: ['User', 'Admin'], default: 'User' })
    role: string;

    @Prop({
        type: [AddressSchema], 
        validate: {
            validator: function (addresses: any) {
                if (!addresses.length) {
                    return true;
                }
                const uniqueAddresses = new Set(addresses.map((address: any) => address.address));
                const defaultAddressCount = addresses.filter((address: any) => address.defaultAddress).length;
                return uniqueAddresses.size === addresses.length && defaultAddressCount === 1;
            },
            message: 'User only has one default address and addresses must be unique'
        }
    })
    address: Address[];


    @Prop(raw({
        imageName: { type: String, default: 'default-avatar.jpg' },
        imageUrl: { type: String, default: `http://localhost:3500/users/default-avatar/default-avatar.jpg` }
    }))
    avatar: Record<string, string>;

    @Prop({ default: true })
    status: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);