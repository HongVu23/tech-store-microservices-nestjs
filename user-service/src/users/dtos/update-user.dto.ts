import { Address } from "../schemas/user.schema";

export class UpdateUserDto {

    username: string;

    password?: string;

    email: string;

    phoneNumber: string;

    address: Address[];

    status?: boolean;
}