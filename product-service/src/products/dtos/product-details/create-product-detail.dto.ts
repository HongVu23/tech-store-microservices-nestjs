import { Types } from "mongoose";
import { DetailItem } from "src/products/interfaces/detail-item.interface";

export class CreateProductDetailDto {

    product: Types.ObjectId;

    guaranteePeriod: number;

    includedAccessories: string[];

    processor?: DetailItem[];

    ramMemoryAndHardDrive?: DetailItem[];

    screen?: DetailItem[];

    graphicsAndAudio?: DetailItem[];

    connectionPortAndExpansionFeature?: DetailItem[];

    additionalInformation?: DetailItem[];

    camera?: DetailItem[];

    selfie?: DetailItem[];

    operatingSystemAndCPU?: DetailItem[];

    ramRom?: DetailItem[];

    connection?: DetailItem[];

    batteryAndCharger?: DetailItem[];

    utility?: DetailItem[];

    generalInformation?: DetailItem[];

    design?: DetailItem[];

    battery?: DetailItem[];

    configurationAndConnection?: DetailItem[];

    details?: DetailItem[];
}