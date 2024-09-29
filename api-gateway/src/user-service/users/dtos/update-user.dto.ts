import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phoneNumber: string;

    @IsNotEmpty()
    address: Array<Record<string, any>>;

    @IsOptional()
    @IsBoolean()
    status?: boolean;
}