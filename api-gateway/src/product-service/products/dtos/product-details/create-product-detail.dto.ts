import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class DetailItem {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    value?: string;
}

export class CreateProductDetailDto {

    @IsNotEmpty()
    @IsNumber()
    guaranteePeriod: number;

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    includedAccessories: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    processor?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    ramMemoryAndHardDrive?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    screen?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    graphicsAndAudio?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    connectionPortAndExpansionFeature?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    additionalInformation?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    camera?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    selfie?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    operatingSystemAndCPU?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    ramRom?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    connection?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    batteryAndCharger?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    utility?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    generalInformation?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    design?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    battery?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    configurationAndConnection?: DetailItem[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetailItem)
    details?: DetailItem[];
}